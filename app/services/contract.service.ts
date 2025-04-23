import { ContratoModel } from '../models/contract.model';

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
}