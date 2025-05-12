import { ICsvStrategy } from '../ICsvStrategy';
import { ContratoModel } from '../../models/contract.model';
import { CSVDownloader } from '../../utils/dowload-csv';
import { uploadCSVFile } from '../../utils/send-file-csv';
import fs from 'fs';
import path from 'path';

export class ContractCsvStrategy implements ICsvStrategy {
  private csv: CSVDownloader;

  constructor() {
    const fileName = CSVDownloader.generateSafeFileName('contratos');
    this.csv = new CSVDownloader(fileName);
  }

  async processRow(row: any, context: Map<string, any>): Promise<void> {
    const codigo = row['Código']?.trim();
    const plan_internet = row['Plan Internet']?.trim();
    const estado_ct = row['Estado CT']?.trim();
    const tipo_plan = row['Tipo de Plan']?.trim();
    const fecha_inicio = row['Fecha Inicio']?.trim();
    const forma_pago = row['Forma de Pago']?.trim();
    const fecha_activacion = row['Fecha Activacion']?.trim();
    const fecha_corte = row['Fecha de Corte']?.trim();
    const servicio_internet = row['Servicio Internet']?.trim();
    const monto_deuda = row['Monto Deuda']?.trim();

    const clienteId = context.get('clienteId'); // ✅ Obtener el clienteId del contexto

    if (!codigo || !clienteId) {
      console.warn('⚠️ Código o clienteId no válidos. Se omite la fila.');
      return;
    }

    const existe = await ContratoModel.findOne({ codigo: codigo });

    if (existe) {
      console.warn(`⚠️ Contrato ya registrado para código: ${codigo}.`);
      return;
    }

    try {
      await ContratoModel.create({
        codigo,
        plan_internet,
        estado_ct,
        tipo_plan,
        fecha_inicio,
        forma_pago,
        fecha_activacion,
        fecha_corte,
        servicio_internet,
        monto_deuda: parseFloat(monto_deuda),
        clienteId, // ✅ Aquí lo guardamos
      });

      //this.csv.addRow('CONTRATOS NUEVOS', codigo);

      console.log(`✅ Contrato creado exitosamente: ${codigo}`);
    } catch (error) {
      console.error(`❌ Error al crear el contrato ${codigo}: ${error}`);
    }
  }

  async flush(context: Map<string, any>): Promise<void> {
    await this.csv.finalize();

    const filePath = this.csv.getPath(); // Asegúrate que CSVDownloader tenga este método
    const fileName = path.basename(filePath);
    const fileStream = fs.createReadStream(filePath);

    const title = 'Carga Masiva Contratos';
    const category = 9;
    await uploadCSVFile({
      title,
      category,
      file: fileStream,
      fileName,
    });


    console.log('✅ CSV de contratos generado exitosamente.');
  }
}
