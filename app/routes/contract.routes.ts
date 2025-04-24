// routes/contract.routes.ts
import { Router } from 'express';
import { updateFormaPago, updatePlanInternet } from '../controllers/contract.controller';

const router = Router();

// Rutas para actualizar datos del contrato

// Actualizar forma de pago
router.put("/:id/forma-pago", updateFormaPago);

// Actualizar plan de internet
router.put("/:id/plan-internet", updatePlanInternet);

export default router;
