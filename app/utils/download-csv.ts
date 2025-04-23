// utils/log-csv.ts
import fs from 'fs';
import path from 'path';

export async function appendCSVRow(fileName: string, csvRow: string): Promise<void> {
  const logDir = path.resolve(__dirname, '../../files/contratos');
  const filePath = path.join(logDir, fileName);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Agrega nueva línea si el archivo ya existe
  const newline = fs.existsSync(filePath) ? '\n' : '';

  fs.appendFileSync(filePath, newline + csvRow);
}
