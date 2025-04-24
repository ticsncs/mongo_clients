import { Router } from 'express';
import { uploadFacturas } from '../controllers/billing.controller';

const router = Router();

// Define aquí tus rutas

// Ruta para subir facturas
router.post('/upload', uploadFacturas);

export default router;
