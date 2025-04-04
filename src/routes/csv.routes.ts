import { Router } from "express";

const router = Router();
type RouteHandler = (req: Request, res: Response) => Promise<Response>;


// Ruta para importar datos desde un Excel
import { verifyCSV, processCSV, processCSVOptimized, getDetailsJson} from "../controllers/csv.controller";


// Ruta para verificar CSV
router.get("/verify/:filename", verifyCSV);

// Ruta para procesar CSV (método original)
router.get("/process/:filename", processCSV);



// Ruta para procesar CSV (método optimizado)
router.get("/process-optimized/:filename", processCSVOptimized);

// Ruta para obtener detalles en formato JSON
router.get("/details", getDetailsJson);


export default router;
