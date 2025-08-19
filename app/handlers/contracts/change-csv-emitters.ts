// utils/change-csv-emitters.ts
import { CSVDownloader } from '../../utils/dowload-csv';
import { uploadCSVFile } from '../../utils/send-file-csv';
import fs from 'fs';
import path from 'path';

let formaPagoCsv: CSVDownloader | null = null;
let planCsv: CSVDownloader | null = null;

export const csvByChangeType = {
  get forma_pago(): CSVDownloader {
    if (!formaPagoCsv) {
      formaPagoCsv = new CSVDownloader(`change-form-pay-${new Date().toISOString().split('T')[0]}.csv`);
    }
    return formaPagoCsv;
  },
  get plan_internet(): CSVDownloader {
    if (!planCsv) {
      planCsv = new CSVDownloader(`change-plan-${new Date().toISOString().split('T')[0]}.csv`);
    }
    return planCsv;
  },

  async flushAll(): Promise<void> {
    const uploads = [
      {
        csv: formaPagoCsv,
        title: 'Puntos por Cambio de Forma de Pago',
        category: "CAMBIO DE FORMA DE PAGO",
      },
      {
        csv: planCsv,
        title: 'Putos por subir de Plan Internet',
        category: "SUBIR PLAN",
      },
    ];

    for (const { csv, title, category } of uploads) {
      if (!csv) continue;

      await csv.finalize();
      const filePath = csv.getPath();
      const fileName = path.basename(filePath);
      const fileStream = fs.createReadStream(filePath);

      await uploadCSVFile({ title, category, file: fileStream, fileName });
      console.log(`📤 CSV subido correctamente: ${title}`);
      console.log(`🗑️ CSV eliminado del sistema: ${filePath}`);

      // Limpiar el CSV después de subirlo
      fs.unlinkSync(filePath);
      console.log(`🗑️ CSV eliminado del sistema: ${filePath}`);
    }
  },
};
