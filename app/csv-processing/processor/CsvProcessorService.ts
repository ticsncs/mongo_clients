
import { createReadStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import csv from 'csv-parser';
import { Transform } from 'stream';
import { ICsvStrategy } from '../ICsvStrategy';

// Promisificamos pipeline para usar async/await
const pipelineAsync = promisify(pipeline);

/**
 * Servicio genérico para procesar archivos CSV usando una estrategia específica (patrón Strategy).
 */
export class CsvProcessorService {
  private objectContext = new Map<string, any>(); // Contexto compartido entre preload, processRow y flush
  private batchSize = 1000;                        // Cantidad de filas a procesar en cada lote
  private processedCount = 0;                      // Contador de filas procesadas

  constructor(
    private strategy: ICsvStrategy,               // Estrategia específica para procesar las filas
    batchSize?: number                            // Batch opcional por constructor
  ) {
    if (batchSize) this.batchSize = batchSize;
  }

  //Procesa un archivo CSV línea por línea usando streams y la estrategia definida.
  async processCSV(filePath: string): Promise<void> {
    const startTime = Date.now();
    console.log(`🚀 Iniciando procesamiento de ${filePath}`);

    // Carga previa de datos (opcional, según la estrategia)
    if (this.strategy.preload) {
      await this.strategy.preload(filePath, this.objectContext);
    }

    let rows: any[] = []; // Acumulador temporal de filas

    // Stream de transformación que procesa cada fila del CSV
    const transformStream = new Transform({
      objectMode: true,
      transform: async (row, _, callback) => {
        rows.push(row);

        // Cuando el lote alcanza el tamaño especificado, lo procesamos
        if (rows.length >= this.batchSize) {
          await this.processBatch(rows);
          rows = []; // Reiniciamos el acumulador
        }

        callback(); // Continuamos el stream
      },
      flush: async (callback) => {
        // Procesamos las últimas filas restantes
        if (rows.length > 0) {
          await this.processBatch(rows);
        }

        // Si la estrategia define una acción al final, la ejecutamos
        if (this.strategy.flush) {
          await this.strategy.flush(this.objectContext);
        }

        callback(); // Cerramos el stream
      }
    });

    // Ejecutamos el pipeline de lectura y transformación de CSV
    await pipelineAsync(
      createReadStream(filePath), // Lee el archivo CSV
      csv(),                      // Parsea el CSV a objetos
      transformStream             // Aplica transformación por lote
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Procesamiento finalizado. ${this.processedCount} filas en ${duration} segundos`);
  }

  
  //Procesa un lote de filas usando la estrategia definida.
  private async processBatch(rows: any[]) {
    const promises = rows.map(row => this.strategy.processRow(row, this.objectContext));
    await Promise.all(promises);
    this.processedCount += rows.length;
  }
}
