import * as XLSX from "xlsx";
import path from "path";
import { ClienteModel } from "../models/client";
import { ContratoModel } from "../models/contract";

export const readExcelAndSave = async (filename: string) => {
  try {
    const filePath = path.join(__dirname, "../utils", filename);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      //console.log("Estas son las row", row)
      // Buscar o crear cliente
      let cliente = await ClienteModel.findOne({ telefono: row["Teléfono"] });

      if (!cliente) {
         cliente = new ClienteModel({
          nombre: row["Cliente"],
          direccion: row["Dirección"],
          telefono: row["Teléfono"],
          contratos: []
        });
        await cliente.save();
      }

      // Crear contrato
      const contrato = new ContratoModel({
        codigo: row["Código"],
        forma_pago: row["Forma de Pago"],
        plan_internet: row["Plan Internet"],
        fecha_inicio: new Date(row["Fecha Inicio"]),
        cliente: cliente._id
      });

      await contrato.save();

      // Agregar referencia al cliente
      cliente.contratos.push(contrato._id);
      await cliente.save();
    }

    return { message: "✅ Datos guardados correctamente en MongoDB" };
  } catch (error) {
    console.error("❌ Error procesando el archivo Excel:", error);
    return { message: "❌ Error al procesar el archivo" };
  }
};
