import { Request, Response } from "express";
import { readCSVAndSave, checkCSVContent } from "../services/csv.service";
import { ClienteModel } from "../models/client";

interface SearchRequest extends Request {
  body: {
    searchPhone: string;
  }
}



// Nuevo método para CSV
export const uploadCSVData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    console.log("Nombre del archivo:", filename);
    
    
    // Si todo está bien, procedemos a guardar
    const result = await readCSVAndSave(filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "❌ Error en el servidor", error });
  }
};



// Función para verificar CSV
export const checkCSV = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const result = await checkCSVContent(filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "❌ Error en el servidor", error });
  }
};

export const getDetailsJson = async (req: Request, res: Response) => {
  try {
    const clientes = await ClienteModel.find().populate("contratos");
    res.json({
      clientes: clientes,
      message: `Se han obtenido: ${clientes.length} en la consulta`
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Error en el servidor", error });
  }
};

// Corregido el tipo para evitar errores de TypeScript
export const getDetailClient = async (req: Request, res: Response) => {
  const { searchPhone } = req.body;
  try {
    const cliente = await ClienteModel.findOne({ telefono: searchPhone });
    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    return res.json({
      cliente: cliente,
      message: "Cliente encontrado"
    });
  } catch (error) {
    return res.status(500).json({ message: "❌ Error en el servidor", error });
  }
};