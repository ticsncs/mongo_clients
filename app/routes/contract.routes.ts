// routes/contract.routes.ts
import { Router } from 'express';
import { updateFormaPago, updatePlanInternet } from '../controllers/contract.controller';

const router = Router();

router.put("/:id/forma-pago", updateFormaPago);
router.put("/:id/plan-internet", updatePlanInternet);

export default router;
