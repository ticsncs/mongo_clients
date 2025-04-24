import { ICsvStrategy } from '../ICsvStrategy';
import { ContratoModel } from '../../models/contract.model';
import { BillingModel } from '../../models/billing.model';

interface LineaFactura {
    contrato: string;
    descripcion: string;
    monto: number;
}

interface FacturaAgrupada {
    lineas: LineaFactura[];
    total: number;
}

export class BillingCsvStrategy implements ICsvStrategy {
    private facturas: Map<string, FacturaAgrupada> = new Map();

    async processRow(row: any, context: Map<string, any>): Promise<void> {
        const nombreCompleto = row['Nombre del socio a mostrar en la factura.']?.trim();
        const lineaRaw = row['Líneas de factura']?.trim();
        const totalRaw = row['Total']?.trim();

        if (!nombreCompleto || !lineaRaw || !totalRaw) return;

        const contratoMatch = lineaRaw.match(/\(CT-(\d+)\)/);
        const descripcionMatch = lineaRaw.match(/\)\s*(.*?)\/CT-/);

        const contrato = contratoMatch ? `CT-${contratoMatch[1]}` : 'N/A';
        const descripcion = descripcionMatch ? descripcionMatch[1].trim() : 'SIN DESCRIPCIÓN';

        const total = parseFloat(totalRaw);

        const lineaFactura: LineaFactura = {
            contrato,
            descripcion,
            monto: total,
        };

        if (!this.facturas.has(contrato)) {
            this.facturas.set(contrato, {
                lineas: [],
                total: 0,
            });
        }

        const factura = this.facturas.get(contrato)!;
        factura.lineas.push(lineaFactura);
        factura.total += total;
    }

    async flush(): Promise<void> {
        const fecha = new Date().toISOString();
        let contratosGuardados = 0;
        let contratosOmitidos = 0;

        for (const [codigoContrato, factura] of this.facturas.entries()) {
            console.log(`Procesando contrato ${codigoContrato} con total ${factura.total}`);
            try {
                const contrato = await ContratoModel.findOne({ codigo: codigoContrato });
                console.log(`Buscando contrato ${codigoContrato}:`, contrato);


                if (!contrato) {
                    console.warn(`⚠️ Contrato ${codigoContrato} no encontrado.`);
                    contratosOmitidos++;
                    continue;
                }

                const descripciones = factura.lineas.map(linea => linea.descripcion);

                await BillingModel.create({
                    id_contrato: contrato._id,
                    fecha_emision: fecha,
                    precio_total: factura.total,
                    detalle: descripciones,
                });

                contratosGuardados++;

            } catch (err) {
                console.error(`❌ Error al guardar factura de contrato ${codigoContrato}:`, err);
                contratosOmitidos++; // por si hubo error
            }
        }

        console.log(`✅ Se guardaron ${contratosGuardados} facturas.`);
        console.log(`⚠️ Se omitieron ${contratosOmitidos} contratos no encontrados o fallidos.`);
    }


}
