import { Router } from 'express';
import csvRoutes from './odoo.routes';
import contractRoutes  from './contract.routes';
import clientsRoutes   from './clients.routes';

const router = Router();

router.use('/odoo', csvRoutes);
router.use('/contract', contractRoutes);
router.use('/clients', clientsRoutes);


export default router;
