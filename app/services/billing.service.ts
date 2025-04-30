import { CsvStrategyFactory } from '../csv-processing/factory/CsvStrategyFactory';
import { CsvProcessorService } from '../csv-processing/processor/CsvProcessorService';


export class BillingService {
  async procesarArchivoFacturacion(rutaArchivo: string): Promise<void> {
    const strategy = CsvStrategyFactory.getStrategy('billing');
    const processor = new CsvProcessorService(strategy);
    await processor.processCSV(rutaArchivo);
  }



}