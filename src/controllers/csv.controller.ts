import { Request, Response } from "express";
import { readCSVAndSave, readCSVAndSaveOptimized, checkCSVContent } from "../services/csv.service";

// Verificar CSV
export const verifyCSV = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const result = await checkCSVContent(filename);
    res.status(result.exists ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error al verificar el archivo CSV",
      error: error.message,
    });
  }
};

// Procesar CSV (método original)
export const processCSV = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const result = await readCSVAndSave(filename);
    res.status(result.exists === false ? 404 : 200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error al procesar el archivo CSV",
      error: error.message,
    });
  }
};

// Procesar CSV (método optimizado)
export const processCSVOptimized = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const result = await readCSVAndSaveOptimized(filename);
    res.status(result.exists === false ? 404 : 200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error al procesar el archivo CSV",
      error: error.message,
    });
  }
};