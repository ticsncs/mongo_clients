import { ICsvStrategy } from '../ICsvStrategy';
import { PaymentModel } from '../../models/payment.model';
import { IPayment } from '../../models/payment.model';
import { procesarPago } from '../../handlers/payments/handler-payment';
import ContratoModel from '../../models/contract.model';

export class PaymentCsvStrategy implements ICsvStrategy {
  private payments: Map<string, IPayment> = new Map();

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

    // ✅ Antes de crear, validamos que no exista ya un Payment para este contrato
    const existe = await PaymentModel.findOne({ contrato: contrato });

    if (existe) {
      console.warn(`⚠️ Pago ya registrado para contrato ${contrato}. Se omite.`);
      return;
    }

    try {
      // ✅ Ahora sí creamos el nuevo Payment
      await PaymentModel.create({
        contrato: contrato,
        fechaPago: fechaPago,
        diario: diario,
        cliente: cliente,
        importe: parseFloat(importe), // lo guardamos como número
        estado: estado
      });

      // ✅ Procesamos el pago para ver si es puntual o en gracia
      const contratoDb = await ContratoModel.findOne({ codigo: contrato });
        if (!contratoDb) {
            console.warn(`⚠️ Contrato no encontrado en la base de datos: ${contrato}`);
            return;
        }

        await procesarPago(contratoDb, fechaPago);

      console.log(`✅ Pago registrado exitosamente para contrato ${contrato}`);
      
    } catch (error) {
      console.error(`❌ Error al procesar la fila para contrato ${contrato}: ${error}`);
    }
  }
}
