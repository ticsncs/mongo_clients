import fs from 'fs';
import path from 'path';

export async function downloadCSV(fileName: string, directoryPath: string, data: string | string[]
): Promise<void> {
  const logDir = path.resolve(__dirname, directoryPath);
  const filePath = path.join(logDir, fileName);

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const content = Array.isArray(data) ? data.join('\n') : data;

  fs.writeFileSync(filePath, content);
}
