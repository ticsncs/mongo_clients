import { ICsvStrategy } from '../ICsvStrategy';
import { PaymentModel } from '../../models/payment.model';
import { procesarPago } from '../../handlers/payments/handler-payment';
import ContratoModel from '../../models/contract.model';
import { normalizar } from '../../utils/normalize';
import { CSVDownloader } from '../../utils/dowload-csv'; // ✅ Importa tu clase aquí
    import { csvByPagoCategoria } from '../../handlers/payments/csvByPagoCategoria';


export class PaymentCsvStrategy implements ICsvStrategy {
  //private payments: Map<string, IPayment> = new Map();
  private csv: CSVDownloader;

  constructor() {
    // Creamos el CSV de pagos cuando instanciamos la estrategia
    const fileName = CSVDownloader.generateSafeFileName('pagos');
    this.csv = new CSVDownloader(fileName);
  }


  async processRow(row: any, context: Map<string, any>): Promise<void> {
    const contratoRaw = row['Contrato']?.trim();
    const fechaPago = row['Fecha']?.trim();
    const diario = row['Diario']?.trim();
    const cliente = row['Cliente/Proveedor']?.trim();
    const importe = row['Importe con signo en la moneda de la compañía']?.trim();
    const estado = row['Estado']?.trim();

    if (!contratoRaw || !fechaPago || !diario || !cliente || !importe || !estado) return;

    // ✅ Extraemos SOLO el código del contrato (ej. "CT-18118")
    const contratoMatch = contratoRaw.match(/(CT-\d+)/);
    const contrato = contratoMatch ? contratoMatch[1] : null;

    if (!contrato) {
      console.warn(`⚠️ Contrato inválido encontrado: ${contratoRaw}`);
      return;
    }

    try {
      // ✅ Buscamos el contrato primero
      const contratoDb = await ContratoModel.findOne({ codigo: contrato });
      if (!contratoDb) {
        console.warn(`⚠️ Contrato no encontrado en la base de datos: ${contrato}`);
        return;
      }

      // ✅ Verificamos si ya existe el pago
      const pagoExistente = await PaymentModel.findOne({ contrato: contrato });
      if (pagoExistente) {
        console.warn(`⚠️ Pago ya registrado para contrato ${contrato}. Omitiendo procesamiento.`);
        return;
      }

      // ✅ Si no existe, creamos el nuevo pago
      const nuevoPago = await PaymentModel.create({
        contrato: contrato,
        fechaPago: fechaPago,
        diario: normalizar(diario),
        cliente: cliente,
        importe: parseFloat(importe),
        estado: estado
      });

      // ✅ Procesamos el nuevo pago
      const resultado = await procesarPago(contratoDb, fechaPago, nuevoPago.diario);

        if (resultado) {
            this.csv.addRow(
                resultado.contrato,
            );
        }
        


      console.log(`✅ Pago registrado exitosamente para contrato ${contrato}`);
      
    } catch (error) {
      console.error(`❌ Error al procesar la fila para contrato ${contrato}: ${error}`);
    }
  }
  async flush(context: Map<string, any>): Promise<void> {
    console.log('\n🔄 Iniciando flush de CSVs...');
    // Al finalizar todo el procesamiento de pagos
    await csvByPagoCategoria.flushAll();

    console.log('✅ Todos los CSVs de pagos generados y enviados correctamente.');
    console.log('🏁 Fin del proceso completo\n');
}
}
