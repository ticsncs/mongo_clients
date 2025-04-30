import { ICsvStrategy } from '../ICsvStrategy';
import { ContratoModel } from '../../models/contract.model';
import { BillingModel } from '../../models/billing.model';
import { obtenerTipoFactura } from '../../handlers/billing/billing-handler';
import { PuntosStrategyFactory } from '../../points-processing/billing-points/PointsStrategyFactory';


interface LineaFactura {
    contrato: string;
    descripcion: string;
    monto: number;
}

interface FacturaAgrupada {
    numeroFactura: string; // 🚀 Nuevo campo
    lineas: LineaFactura[];
    total: number;
}

export class BillingCsvStrategy implements ICsvStrategy {
    private facturas: Map<string, FacturaAgrupada> = new Map();

    async processRow(row: any, context: Map<string, any>): Promise<void> {
        const numeroIdentificador = row['Número']?.trim();
        const lineaRaw = row['Líneas de factura']?.trim();
        const totalRaw = row['Total']?.trim();

        if (!numeroIdentificador || !lineaRaw || !totalRaw) return;

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

        if (!this.facturas.has(numeroIdentificador)) { // 🚀 Usamos el número como key
            this.facturas.set(numeroIdentificador, {
                numeroFactura: numeroIdentificador,
                lineas: [],
                total: 0,
            });
        }

        const factura = this.facturas.get(numeroIdentificador)!;
        factura.lineas.push(lineaFactura);
        factura.total += total;
    }

    async flush(objectContext: Map<string, any>): Promise<void> {
        const fecha = new Date().toISOString();
        let contratosGuardados = 0;
        let contratosOmitidos = 0;

        for (const [numeroFactura, factura] of this.facturas.entries()) {
            console.log(`Procesando factura ${numeroFactura} con total ${factura.total}`);
            try {
                const contratoCodigo = factura.lineas[0].contrato;
                const contrato = await ContratoModel.findOne({ codigo: contratoCodigo });
                if (!contrato) {
                    console.warn(`⚠️ Contrato ${contratoCodigo} no encontrado.`);
                    contratosOmitidos++;
                    continue;
                }
                const descripciones = factura.lineas.map(linea => linea.descripcion);
                const billingTemporal = {
                    detalle: descripciones,
                    precio_total: factura.total,
                  } as any;
                  const activacionStrategy = PuntosStrategyFactory.getStrategy('activacion');
                  const ventaStrategy = PuntosStrategyFactory.getStrategy('venta');
                  // Evaluar estrategias
                  const esActivacion = activacionStrategy.evaluar(billingTemporal);
                  const esVenta = ventaStrategy.evaluar(billingTemporal);
                  // Calcular puntos solo si corresponde
                  const puntosActivacion = esActivacion ? activacionStrategy.calcularPuntos(billingTemporal) : 0;
                  const puntosVenta = esVenta ? ventaStrategy.calcularPuntos(billingTemporal) : 0;
                  const puntosTotales = puntosActivacion + puntosVenta;
                  // Decidir si tiene puntos en general
                  const hadPoints = puntosTotales > 0;
                  console.log('🎯 Puntos totales para esta factura:', puntosTotales);
                try {
                    const billing = await BillingModel.create({
                        id_factura: numeroFactura,
                        id_contrato: contrato._id,
                        fecha_emision: fecha,
                        precio_total: factura.total,
                        detalle: descripciones,
                        givePoints: hadPoints,
                      });
                    console.log("📡 Requiere emitir socket:", billing.givePoints);
                    obtenerTipoFactura(billing, BillingModel.emitChange.bind(BillingModel));
                    contratosGuardados++;
                } catch (err: any) {
                    if (err.code === 11000) {
                        console.warn(`⚠️ Factura duplicada detectada (id_factura): ${numeroFactura}`);
                        contratosOmitidos++;
                    } else {
                        console.error(`❌ Error al crear factura ${numeroFactura}:`, err);
                        contratosOmitidos++;
                    }
                }
            } catch (err) {
                console.error(`❌ Error general al procesar factura ${numeroFactura}:`, err);
                contratosOmitidos++;
            }
        }

        console.log(`✅ Se guardaron ${contratosGuardados} facturas.`);
        console.log(`⚠️ Se omitieron ${contratosOmitidos} facturas duplicadas o con error.`);
    }
}
