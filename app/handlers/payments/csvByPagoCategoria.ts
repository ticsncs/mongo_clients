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
    // Usamos los getters para obtener las instancias actualizadas
    const uploads = [
      {
        csv: this.efectivo_puntual,
        title: 'Pagos Puntuales en Efectivo',
        category: "PAGO PUNTUAL EFECTIVO",
      },
      {
        csv: this.efectivo_gracia,
        title: 'PAGO PERIODO DE GRACIA EFECTIVO',
        category: "PAGO PERIODO DE GRACIA EFECTIVO",
      },
      {
        csv: this.digitales_puntual,
        title: 'PAGO PUNTUAL MEDIOS DIGITALES',
        category: "PAGO PUNTUAL MEDIOS DIGITALES",
      },
      {
        csv: this.digitales_gracia,
        title: 'PAGO PERIODO DE GRACIA MEDIOS DIGITALES',
        category: "PAGO PERIODO DE GRACIA MEDIO DIGITALES",
      },
      {
        csv: this.debito,
        title: 'PAGO POR DÉBITO BANCARIO',
        category: "PAGO POR DÉBITO BANCARIO",
      },
    ];

    ;
    for (const { csv, title, category } of uploads) {
      console.log('\n----------------------------------------');
      if (!csv) {
        console.log('⚠️ No hay CSV para esta categoría, saltando...');
        continue;
      }


      await csv.finalize();
      const filePath = csv.getPath();
      
      try {
        if (fs.existsSync(filePath)) {
          console.log(`\n📄 Preparando para subir CSV: ${path.basename(filePath)}`);
          const fileStream = fs.createReadStream(filePath);
          
          // Primero subir el archivo
          const response = await uploadCSVFile({
            title,
            category,
            file: fileStream,
            fileName: path.basename(filePath)
          });

          
          // Eliminar el archivo solo si la subida fue exitosa o si se debe eliminar por validación
          if (response.shouldDelete || !response.error) {
            try {
              await fs.promises.unlink(filePath);
              console.log(`🗑️ Archivo CSV eliminado después de enviar: ${filePath}`);
            } catch (unlinkError) {
              if (unlinkError.code !== 'ENOENT') {
                console.error(`❌ Error al eliminar el archivo ${filePath}:`, unlinkError);
              }
            }
          }

          if (!response.error) {
            console.log(`📤 CSV subido correctamente: ${title}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error al procesar archivo ${filePath}:`, error);
      }

      console.log(`📤 CSV subido correctamente: ${title}`);
    }
  },
};
