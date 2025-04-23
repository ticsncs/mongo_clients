import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import csv from 'csv-parser';
import pLimit from 'p-limit';
import { Transform } from 'stream';
import { ClientService } from './client.service';
import { ContractService } from './contract.service';
import { LoggerService } from './logger.service';

const pipelineAsync = promisify(pipeline);

export class CsvProcessorService {
  private limit = pLimit(20);
  private bulkOps: any[] = [];
  private bulkSize = 2000;
  private clienteCache = new Map<string, string>();

  constructor(
    private clienteService = new ClientService(),
    private contratoService = new ContractService(),
    private logger = new LoggerService()
  ) {}

  async processCSV(filePath: string): Promise<void> {
    const transformStream = new Transform({
      objectMode: true,
      transform: (row, _, callback) => {
        this.limit(async () => {
          try {
            const { correo, clienteId } = await this.getOrCreateCliente(row);
      
            if (!correo || !row['Código']) return callback();
      
            this.bulkOps.push(this.contratoService.buildUpdateOp(row, clienteId));
      
            if (this.bulkOps.length >= this.bulkSize) {
              await this.flushBulkOps();
            }
      
            callback();
          } catch (error: any) {
            this.logger.error(`Fila fallida: ${error.message}`);
            callback(error);
          }
        });
      }
      
    });

    await pipelineAsync(
      fs.createReadStream(filePath),
      csv(),
      transformStream
    );

    if (this.bulkOps.length > 0) {
      await this.flushBulkOps();
    }

    this.logger.info('✅ Proceso finalizado correctamente');
  }

  private async getOrCreateCliente(row: any): Promise<{ correo: string, clienteId: string }> {
    const correo = row['Cliente/Correo electrónico']?.trim();
    const raw = row['Cliente']?.trim();
    const cedulaMatch = raw?.match(/\d{10,}/);
    const cedula = cedulaMatch ? cedulaMatch[0] : undefined;
    const nombre = raw?.replace(/^\d+\s*/, '');
    const telefono = row['Teléfono']?.trim();

    //if (!correo) throw new Error('Correo no válido');

    if (this.clienteCache.has(correo)) {
      return { correo, clienteId: this.clienteCache.get(correo)! };
    }

    const clienteId = await this.clienteService.upsertCliente({ correo, nombre, cedula, telefono });
    this.clienteCache.set(correo, clienteId);
    return { correo, clienteId };
  }

  private async flushBulkOps(): Promise<void> {
    const ops = this.bulkOps.splice(0, this.bulkOps.length);
    await this.contratoService.bulkWrite(ops);
    this.logger.info(`✅ BulkWrite ejecutado con ${ops.length} operaciones`);
  }
}
