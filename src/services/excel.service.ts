import * as XLSX from "xlsx";
import path from "path";
import { ClienteModel } from "../models/client";
import { ContratoModel } from "../models/contract";

export const readExcelAndSave = async (filename: string) => {
  try {
    const filePath = path.join(__dirname, "../utils", filename);
    console.log(filePath)
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a JSON
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      //console.log("Estas son las row", row)
      // Buscar o crear cliente
      //console.log("Encabezados en Excel:", Object.keys(row));

      let cliente = await ClienteModel.findOne({ telefono: row["Teléfono"] });

      if (!cliente) {
        cliente = new ClienteModel({
          nombre: row["Cliente"] || "undefined",
          telefono: row["Teléfono"] || "undefined",
          correo: row["Cliente/Correo electrónico"] || "undefined",
          contratos: [] 
        });
        await cliente.save();
      }

      // Crear contrato
      const contrato = new ContratoModel({
        codigo: row["Código"],
        plan_internet: row["Plan Internet"] || "undefined",
        servicio_internet: row["Servicio Internet"] || "undefined" ,
        //fecha_inicio: new Date(row["Fecha Inicio"]),
        estado_ct: row ["Estado CT"] || "undefined",
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
