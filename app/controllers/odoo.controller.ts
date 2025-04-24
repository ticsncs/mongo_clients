import { Request, Response } from 'express';
import { CsvService } from '../services/csv.service';
import { successResponse,errorResponse} from '../utils/response';


export const greet = (req: Request, res: Response): void => {
    const name = req.query.name || 'World';
    successResponse(res, 200, `Hello ${name}!`);
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