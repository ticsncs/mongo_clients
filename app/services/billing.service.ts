import { CsvStrategyFactory } from '../csv-processing/factory/CsvStrategyFactory';
import { CsvProcessorService } from '../csv-processing/processor/CsvProcessorService';
import { ContratoModel } from '../models/contract.model';
import { contieneActivacion } from '../handlers/billing/billing-line-activation';

export class BillingService {
  async procesarArchivoFacturacion(rutaArchivo: string): Promise<void> {
    const strategy = CsvStrategyFactory.getStrategy('billing');
    const processor = new CsvProcessorService(strategy);
    await processor.processCSV(rutaArchivo);
  }

  
  async procesarDescargas(){
    const idContrato = contieneActivacion;
    const contrato = await ContratoModel.findById()

  }

}