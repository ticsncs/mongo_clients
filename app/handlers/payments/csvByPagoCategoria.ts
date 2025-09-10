// utils/csvByPagoCategoria.ts
import { CSVDownloader } from '../../utils/dowload-csv';
import { uploadCSVFile } from '../../utils/send-file-csv';
import fs from 'fs';
import path from 'path';

const fecha = new Date().toISOString().split('T')[0]; // "2025-04-29"

let efectivoPuntual: CSVDownloader | null = null;
let efectivoGracia: CSVDownloader | null = null;
let digitalesPuntual: CSVDownloader | null = null;
let digitalesGracia: CSVDownloader | null = null;
let transferencia: CSVDownloader | null = null;
let debito: CSVDownloader | null = null;

export const csvByPagoCategoria = {
  get efectivo_puntual() {
    if (!efectivoPuntual) {
      efectivoPuntual = new CSVDownloader(`efectivo-puntual-${fecha}.csv`);
    }
    return efectivoPuntual;
  },

  get efectivo_gracia() {
    if (!efectivoGracia) {
      efectivoGracia = new CSVDownloader(`efectivo-gracia-${fecha}.csv`);
    }
    return efectivoGracia;
  },

  get digitales_puntual() {
    if (!digitalesPuntual) {
      digitalesPuntual = new CSVDownloader(`digitales-puntual-${fecha}.csv`);
    }
    return digitalesPuntual;
  },

  get digitales_gracia() {
    if (!digitalesGracia) {
      digitalesGracia = new CSVDownloader(`digitales-gracia-${fecha}.csv`);
    }
    return digitalesGracia;
  },

  get transferencia() {
    if (!transferencia) {
      transferencia = new CSVDownloader(`transferencia-${fecha}.csv`);
    }
    return transferencia;
  },

  get debito() {
    if (!debito) {
      debito = new CSVDownloader(`debito-bancario-${fecha}.csv`);
    }
    return debito;
  },

  async flushAll(): Promise<void> {
    console.log('\n📦 Iniciando envío de todos los CSVs...');
    const uploads = [
      {
        csv: efectivoPuntual,
        title: 'Pagos Puntuales en Efectivo',
        category: "PAGO PUNTUAL EFECTIVO",
      },
      {
        csv: efectivoGracia,
        title: 'PAGO PERIODO DE GRACIA EFECTIVO',
        category: "PAGO PERIODO DE GRACIA EFECTIVO",
      },
      {
        csv: digitalesPuntual,
        title: 'PAGO PUNTUAL MEDIOS DIGITALES',
        category: "PAGO PUNTUAL MEDIOS DIGITALES",
      },
      {
        csv: digitalesGracia,
        title: 'PAGO PERIODO DE GRACIA MEDIOS DIGITALES',
        category: "PAGO PERIODO DE GRACIA MEDIO DIGITALES",
      },
      {
        csv: debito,
        title: 'PAGO POR DÉBITO BANCARIO',
        category: "PAGO POR DÉBITO BANCARIO",
      },
    ];

    console.log(`\n📅 Fecha de los CSVs: ${fecha}`)
    ;
    for (const { csv, title, category } of uploads) {
      console.log('----------------------------------------');
      console.log(`🔍 Procesando categoría: ${category}`);
      console.log('scriptor: csvByPagoCategoria.flushAll', csv);
      if (!csv) continue;
      console.log('scriptor: csvByPagoCategoria.flushAll', csv);


      await csv.finalize();
      const filePath = csv.getPath();
      const fileName = path.basename(filePath);
      const fileStream = fs.createReadStream(filePath);

      console.log(`\n📄 Preparando para subir CSV: ${fileName}`);

      await uploadCSVFile({ title, category, file: fileStream, fileName });

      console.log(`📤 CSV subido correctamente: ${title}`);
    }
  },
};
