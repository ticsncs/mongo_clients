import fs from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import csv from 'csv-parser';
import { Transform } from 'stream';
import { ClientService } from './client.service';
import { ContractService } from './contract.service';
import { LoggerService } from './logger.service';

const pipelineAsync = promisify(pipeline);

export class CsvProcessorService {
  private bulkSize = 2000; // Aumentado para reducir operaciones de DB
  private clienteCache = new Map<string, string>();
  private pendingRows: any[] = [];
  private processedCount = 0;

  constructor(
    private clienteService = new ClientService(),
    private contratoService = new ContractService(),
    private logger = new LoggerService(),
    private batchSize = 1000 // Para procesar lotes de registros en memoria
  ) {}

  async processCSV(filePath: string): Promise<void> {
    const startTime = Date.now();
    this.logger.info(`🚀 Iniciando procesamiento de ${filePath}`);

    // Cargar clientes frecuentes al inicio para evitar consultas repetidas
    await this.preloadClientes(filePath);

    let rows: any[] = [];
    
    const transformStream = new Transform({
      objectMode: true,
      transform: (row, _, callback) => {
        rows.push(row);
        
        // Procesar en lotes para evitar saturar la memoria
        if (rows.length >= this.batchSize) {
          this.processBatch(rows);
          rows = [];
        }
        
        callback();
      },
      flush: async (callback) => {
        // Procesar los registros restantes
        if (rows.length > 0) {
          await this.processBatch(rows);
        }
        
        // Finalizar los últimos bulkOps
        if (this.pendingRows.length > 0) {
          await this.processPendingRows();
        }
        
        callback();
      }
    });

    await pipelineAsync(
      createReadStream(filePath),
      csv(),
      transformStream
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    this.logger.info(`✅ Proceso finalizado correctamente. ${this.processedCount} registros procesados en ${duration} segundos`);
  }

   async getRecordCount(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      createReadStream(filePath)
        .pipe(csv())
        .on('data', () => count++)
        .on('end', () => resolve(count))
        .on('error', (error) => reject(error));
    }
    );
  }

  private async preloadClientes(filePath: string): Promise<void> {
    // Obtener correos únicos del CSV para precargar clientes
    const emails = new Set<string>();
    
    await new Promise<void>((resolve) => {
      createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const correo = row['Cliente/Correo electrónico']?.trim();
          if (correo) emails.add(correo);
        })
        .on('end', async () => {
          if (emails.size > 0) {
            // Precargar clientes en lotes de 1000
            const emailBatches = Array.from(emails).reduce((batches, email, i) => {
              const batchIndex = Math.floor(i / 1000);
              if (!batches[batchIndex]) batches[batchIndex] = [];
              batches[batchIndex].push(email);
              return batches;
            }, [] as string[][]);
            
            for (const batch of emailBatches) {
              const clientesMap = await this.clienteService.getClientesByEmails(batch);
              for (const [correo, id] of Object.entries(clientesMap)) {
                this.clienteCache.set(correo, id);
              }
            }
            
            this.logger.info(`📋 Precargados ${this.clienteCache.size} clientes de ${emails.size} correos únicos`);
          }
          resolve();
        });
    });
  }

  private async processBatch(rows: any[]): Promise<void> {
    // Procesar filas en paralelo en lotes más pequeños
    const batches = this.splitIntoBatches(rows, 200);
    const promises = batches.map(batch => this.processRowsBatch(batch));
    await Promise.all(promises);
  }

  private splitIntoBatches<T>(array: T[], size: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  private async processRowsBatch(rows: any[]): Promise<void> {
    const clientesToCreate: any[] = [];
    
    // Agrupar y preparar datos
    for (const row of rows) {
      const correo = row['Cliente/Correo electrónico']?.trim();
      if (!correo || !row['Código']) continue;
      
      if (!this.clienteCache.has(correo)) {
        const raw = row['Cliente']?.trim();
        const cedulaMatch = raw?.match(/\d{10,}/);
        const cedula = cedulaMatch ? cedulaMatch[0] : undefined;
        const nombre = raw?.replace(/^\d+\s*/, '');
        const telefono = row['Teléfono']?.trim();
        
        clientesToCreate.push({ correo, nombre, cedula, telefono });
      }
      
      // Añadir a pendientes
      this.pendingRows.push(row);
    }
    
    // Crear clientes en lote si hay nuevos
    if (clientesToCreate.length > 0) {
      const clientesCreated = await this.clienteService.bulkUpsertClientes(clientesToCreate);
      for (const { correo, id } of clientesCreated) {
        this.clienteCache.set(correo, id);
      }
    }
    
    // Procesar las filas pendientes si alcanzamos el tamaño de lote
    if (this.pendingRows.length >= this.bulkSize) {
      await this.processPendingRows();
    }
  }

  private async processPendingRows(): Promise<void> {
    const rows = this.pendingRows.splice(0, this.bulkSize);
    const bulkOps = [];
    
    for (const row of rows) {
      const correo = row['Cliente/Correo electrónico']?.trim();
      if (!correo || !row['Código']) continue;
      
      const clienteId = this.clienteCache.get(correo);
      if (clienteId) {
        bulkOps.push(this.contratoService.buildUpdateOp(row, clienteId));
        this.processedCount++;
      }
    }
    
    if (bulkOps.length > 0) {
      await this.contratoService.bulkWrite(bulkOps);
      this.logger.info(`✅ BulkWrite ejecutado con ${bulkOps.length} operaciones`);
    }
  }
}