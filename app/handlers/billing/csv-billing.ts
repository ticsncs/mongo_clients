import { CSVDownloader } from '../../utils/dowload-csv';
import fs from 'fs';
import path from 'path';
import { uploadCSVFile } from '../../utils/send-file-csv';
import dotenv from 'dotenv';

dotenv.config();

const fecha = new Date().toISOString().split('T')[0];

let ventasInstance: CSVDownloader | null = null;
let activacionesInstance: CSVDownloader | null = null;

export const csvBilling = {
  get ventas() {
    if (!ventasInstance) {
      ventasInstance = new CSVDownloader(`billings-sales-${fecha}.csv`, ['código_id', 'points']);
    }
    return ventasInstance;
  },

  get activaciones() {
    if (!activacionesInstance) {
      activacionesInstance = new CSVDownloader(`billings-activation-${fecha}.csv`, ['Código-CT']);
    }
    return activacionesInstance;
  },

  async flushAll() {
    const uploads = [
      {
        csv: ventasInstance,
        title: 'Puntos por venta de productos',
        category: 9,
      },
      {
        csv: activacionesInstance,
        title: 'Puntos por activación de Zapping/Go Max',
        category: 19,
      },
    ];

    for (const { csv, title, category } of uploads) {
      if (!csv) continue; // si no fue usado, lo ignoramos

      await csv.finalize();

      const filePath = csv.getPath();
      const fileName = path.basename(filePath);
      const fileStream = fs.createReadStream(filePath);

      await uploadCSVFile({
        title,
        category,
        file: fileStream,
        fileName,
      });

      console.log(`📤 CSV subido correctamente: ${title}`);
    }
  },
};
