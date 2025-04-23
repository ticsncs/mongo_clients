import { ContratoModel } from '../models/contract.model';
import { IContrato } from '../models/contract.model';
import { handleContratoUpdate } from '../handlers/contracts/contract-handler';
import { isCambioFormaPagoRelevante } from '../handlers/contracts/contract-update-pay-form'
import { isCambioPlanRelevante } from '../handlers/contracts/contract-update-plans-change';


export class ContractService {
    buildUpdateOp(row: any, clienteId: string): any {
        const codigo = row['Código']?.trim();
        return {
          updateOne: {
            filter: { codigo },
            update: {
              $set: {
                codigo,
                plan_internet: row['Plan Internet']?.trim(),
                estado_ct: row['Estado CT']?.trim(),
                tipo_plan: row['Tipo de Plan']?.trim(),
                fecha_inicio: row['Fecha Inicio']?.trim(),
                forma_pago: row['Forma de Pago']?.trim(),
                fecha_activacion: row['Fecha Activacion']?.trim(),
                fecha_corte: row['Fecha de Corte']?.trim(),
                servicio_internet: row['Servicio Internet']?.trim(),
                monto_deuda: row['Monto Deuda']?.trim(),
                cliente: clienteId,
              },
            },
            upsert: true,
            setDefaultsOnInsert: true,
          },
        };
      }
    
      async bulkWrite(ops: any[]): Promise<void> {
        await ContratoModel.bulkWrite(ops);
      }

      async actualizarDatosContrato(id: string, datosActualizados: Partial<IContrato>): Promise<IContrato | null> {
        const reglas = [isCambioPlanRelevante, isCambioFormaPagoRelevante];
      
        try {
          const prevDoc = await ContratoModel.findById(id).lean();
      
          const contratoActualizado = await ContratoModel.findOneAndUpdate(
            { _id: id },
            { $set: datosActualizados },
            { new: true, runValidators: true }
          ).lean();
      
          if (prevDoc && contratoActualizado) {
            await handleContratoUpdate(prevDoc, contratoActualizado, reglas, ContratoModel.emitChange.bind(ContratoModel));
          }
      
          return contratoActualizado;
        } catch (error: any) {
          throw new Error(`Error al actualizar datos del contrato: ${error.message}`);
        }
      }

        
}