import { Router, Request, Response } from "express";

// Controladores
import { 
  verifyCSV, 
  get_data_client,
  processCSVOptimized, 
  getDetailsJson, 
} from "../controllers/csv.controller";

// Definición de tipo para controladores asíncronos (opcional pero útil)
type RouteHandler = (req: Request, res: Response) => Promise<Response>;

const router = Router();

// 🔄 Ruta para verificar CSV
router.get("/verify/:filename", verifyCSV);
// 📊 Ruta para obtener datos de cliente
router.get("/get/data/:email/:phone", get_data_client);

// ⚙️ Ruta para procesar CSV de forma optimizada
router.get("/process-optimized/:filename", processCSVOptimized);

// 📄 Ruta para obtener detalles en formato JSON
router.get("/details", getDetailsJson);

// 🔍 Ruta para obtener detalles de cliente por estado_ct, correo o teléfono

export default router;
