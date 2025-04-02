import { Request, Response } from "express";
import { readExcelAndSave } from "../services/excel.service";
import { ClienteModel } from "../models/client";

interface SearchRequest extends Request {
  body: {
    searchPhone: string;
  }
}

export const uploadExcelData = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const result = await readExcelAndSave(filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "❌ Error en el servidor", error });
  }
};


export const getDetailsJson = async (req: Request, res: Response) => {
    try {
      const clientes = await ClienteModel.find().populate("contratos"); // Relacionar clientes con contratos
      res.json({
        clientes: clientes,
        message: `Se han obtenido: ${clientes.length} en la consulta`
      });
    } catch (error) {
      res.status(500).json({ message: "❌ Error en el servidor", error });
    }
  };




  export const getDetailClient = async (req: Request, res: Response) =>  {
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
