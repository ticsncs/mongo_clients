import fs from 'fs';
import path from 'path';

/**
 * Clase para generar CSVs con comillas alrededor de cada valor
 */
export class CSVDownloader {
  private filePath: string;
  private fileStream: fs.WriteStream;
  private headers: string[] = ['Código-CT'];

  constructor(fileName: string) {
    const outputDir = path.resolve('public', 'exports');

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
    } catch (error) {
      console.error('❌ Error creando carpeta de exportación:', error);
      throw new Error('No se pudo crear la carpeta para exportar el CSV.');
    }

    // ✅ No modificar el fileName, lo usamos directamente
    this.filePath = path.join(outputDir, fileName);

    this.fileStream = fs.createWriteStream(this.filePath, { flags: 'w' });

    // ✅ Escribir los headers entre comillas
    this.fileStream.write(this.headers.map(this.escapeValue).join(',') + '\n');
  }


  /**
   * Agrega una nueva fila al CSV
   */
  public addRow(codigo: string): void {
    if (!this.fileStream) {
      throw new Error('El archivo CSV no está inicializado.');
    }

    const values = [
      this.escapeValue(codigo),
    ];

    this.fileStream.write(values.join(',') + '\n');
  }

  /**
   * Finaliza y cierra el CSV correctamente
   */
  public async finalize(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.fileStream.end(() => {
        console.log(`✅ CSV generado exitosamente en: ${this.filePath}`);
        resolve(this.filePath);
      });

      this.fileStream.on('error', (err) => {
        reject(`❌ Error al finalizar el CSV: ${err}`);
      });
    });
  }

  /**
   * Agrega comillas a los valores (y escapa comillas internas)
   */
  private escapeValue(value: string): string {
    if (value.includes('"')) {
      value = value.replace(/"/g, '""'); // Escape interno
    }
    return `"${value}"`; // Rodearlo de comillas
  }

  /**
   * Genera nombre de archivo seguro
   */
  public static generateSafeFileName(baseName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${baseName}-${timestamp}.csv`;
  }

}
export default CSVDownloader;