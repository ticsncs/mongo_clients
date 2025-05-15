import { Request, Response } from 'express';
import { CsvService } from '../services/csv.service';
import { successResponse, errorResponse } from '../utils/response';
import { CsvProcessorService } from '../csv-processing/processor/CsvProcessorService';
import { CsvStrategyFactory } from '../csv-processing/factory/CsvStrategyFactory';


export const greet = (req: Request, res: Response): void => {
  const name = req.query.name || 'World';
  successResponse(res, 200, `Hello ${name.toString}!`);
};


export const odooContractCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now(); // Start timing

    const csvService = new CsvService(); // Instancia del servicio CSV


    const file = req.file; // multer coloca el archivo aquí

    // Verificar si el archivo fue recibido correctamente
    if (!file) {
      errorResponse(res, 400, '❌ No se recibió ningún archivo CSV');
    }

    // Obtener el número de registros en el archivo CSV
    //const recordCount = await csvService.getRecordCount(file.path);
    //console.log(`📊 Número de registros en el archivo CSV: ${recordCount}`);
    await csvService.readCSVAndSaveOptimized(file.path); // Procesar el archivo CSV

    const endTime = Date.now(); // End timing
    const executionTime = endTime - startTime; // Calculate execution time

    successResponse(res, 200, ('✅ Archivo CSV procesado y guardado correctamente '), {
      executionTime: `${executionTime} ms`,
    });

  } catch (error) {
    console.error('❌ Error al enviar archivo a la API:', error);
    errorResponse(res, 500, '❌ Error al enviar archivo a la API', error);
  }
};

export const odooBillingCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();

    const file = req.file;
    console.log('🚀 Iniciando procesamiento de facturas con', file);
    if (!file) {
      errorResponse(res, 400, '❌ No se recibió ningún archivo CSV');
    }

    // ✅ Obtener la estrategia y pasarla al procesador
    const strategy = CsvStrategyFactory.getStrategy('billing');

    const csvProcessor = new CsvProcessorService(strategy);


    await csvProcessor.processCSV(file.path);

    const executionTime = Date.now() - startTime;
    successResponse(res, 200, '✅ Factura CSV procesada correctamente', {
      executionTime: `${executionTime} ms`
    });

  } catch (error) {
    console.error('❌ Error al procesar CSV de facturación:', error);
    errorResponse(res, 500, '❌ Error al procesar CSV de facturación', error);
  }
};


export const odooPaymentCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const startTime = Date.now();

    const file = req.file;
    console.log('🚀 Iniciando procesamiento de pagos con', file);
    if (!file) {
      errorResponse(res, 400, '❌ No se recibió ningún archivo CSV');
    }

    // ✅ Obtener la estrategia y pasarla al procesador
    const strategy = CsvStrategyFactory.getStrategy('payment');

    const csvProcessor = new CsvProcessorService(strategy);

    await csvProcessor.processCSV(file.path);

    const executionTime = Date.now() - startTime;
    successResponse(res, 200, '✅ Payments CSV procesada correctamente', {
      executionTime: `${executionTime} ms`
    });

  } catch (error) {
    console.error('❌ Error al procesar CSV de facturación:', error);
    errorResponse(res, 500, '❌ Error al procesar CSV de facturación', error);
  }
};