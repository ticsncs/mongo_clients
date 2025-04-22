import { Router } from 'express';
import csvRoutes from './odoo.routes';
import contractRoutes  from './contract.routes';
import clientsRoutes   from './clients.routes';
import billingRoutes   from './billing.routes';

const router = Router();

router.use('/odoo', csvRoutes);
router.use('/contract', contractRoutes);
router.use('/clients', clientsRoutes);
router.use('/billing', billingRoutes);

export default router;
