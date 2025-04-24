
import fs from 'fs';
import csv from 'csv-parser';
import pLimit from 'p-limit';
import { ContratoModel } from '../models/contract.model';
import {ClienteModel, getIdByEmail} from '../models/client.model';

export class CsvService {
  async readCSVAndSaveOptimized(filePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const stream = fs.createReadStream(filePath);
      const clientesCache = new Map<string, string>(); // correo → clienteId
      const contratoBulkOps: any[] = [];

      const limit = pLimit(15); // máximo 10 operaciones concurrentes
      const bulkWriteInterval = 5000; // 5 segundos
      let pendingOps = 0;


      const flushBulk = async () => {
        if (contratoBulkOps.length > 0) {
          const batch = contratoBulkOps.splice(0, contratoBulkOps.length);
          try {
            await ContratoModel.bulkWrite(batch);
            console.log(`✅ Se guardaron ${batch.length} contratos en lote`);
          } catch (e) {
            console.error('❌ Error en bulkWrite:', e.message);
          }
        }
      };

      const interval = setInterval(() => {
        flushBulk();
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`📊 Memoria usada: ${Math.round(used * 100) / 100} MB`);
      }, bulkWriteInterval);

      stream
        .pipe(csv())
        .on('data', (row) => {
          pendingOps++;
          limit(async () => {
            try {
              const correo = row['Cliente/Correo electrónico']?.trim();
              
              const clienteRaw = row['Cliente']?.trim();

              // Extraer cédula si tiene al menos 10 dígitos
              const cedulaMatch = clienteRaw?.match(/\d{10,}/);
              const cedula = cedulaMatch ? cedulaMatch[0] : undefined;

              // Extraer solo el nombre quitando la cédula
              const nombre = clienteRaw?.replace(/^\d+\s*/, ''); 
              const telefono = row['Teléfono']?.trim();
              const codigo = row['Código']?.trim();

              if (!correo || !codigo) return;

              let clienteId = await getIdByEmail(correo);          let cliente: any = null; 

              if(!clienteId){
                const newCliente = {
                  correo,
                  nombre,
                  cedula,
                  telefono,
                };
                cliente = await ClienteModel.create(newCliente);
                if (!cliente) {
                  throw new Error(`No se pudo crear cliente con correo: ${correo}`);
                }
                console.log('🟢 Cliente creado con id:', cliente._id);
              } else{
                
                const setData: any = { nombre, telefono };
                if (cedula) setData.cedula = cedula;

                cliente = await ClienteModel.findOneAndUpdate(
                  { correo },
                  { $set: setData },
                  { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                if (!cliente) {
                  throw new Error(`No se pudo crear/actualizar cliente con correo: ${correo}`);
                }
                console.log('🔵 Cliente actualizado con id:', cliente._id);
              }

              
              console.log('🟢 Contrato con id cliente:', cliente._id);
              contratoBulkOps.push({
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
                      clienteId: cliente._id,
                      servicio_internet: row['Servicio Internet']?.trim(),
                      monto_deuda: row['Monto Deuda']?.trim(),

                    },
                  },
                  upsert: true, // Crea si no existe
                  new: true, // Devuelve el documento actualizado
                  setDefaultsOnInsert: true, // Establece valores por defecto
                }, 
              });
            } catch (error) {
              console.error('❌ Error al procesar fila:', error.message);
            } finally {
              pendingOps--;
            }
          });
        })
        .on('end', async () => {
          const waitForPending = setInterval(async () => {
            if (pendingOps === 0) {
              clearInterval(waitForPending);
              clearInterval(interval);
              await flushBulk();
              console.log('✅ Proceso optimizado finalizado.');
              resolve();
            }
          }, 500);
        })
        .on('error', (err) => {
          clearInterval(interval);
          reject(err);
        });
    });
  }
}
