import { Router } from "express";
import { uploadExcelData } from "../controllers/excel.controller";
import { getDetailsJson } from "../controllers/excel.controller";
import { getDetailClient } from "../controllers/excel.controller";

const router = Router();
type RouteHandler = (req: Request, res: Response) => Promise<Response>;


// Ruta para importar datos desde un Excel
router.post("/import/:filename", uploadExcelData);
router.get("/clients", getDetailsJson);
// La ruta debe coincidir con cómo recoges el parámetro
//router.post("/search", getDetailClient);

export default router;
