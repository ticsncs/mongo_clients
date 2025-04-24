import { Router } from 'express'; 
import { greet, odooContractCsv, odooBillingCsv } from '../controllers/odoo.controller'; // Importar el controlador de Odoo
import { upload }  from '../utils/multer';



const router = Router();

router.get('/greet', greet); // Ruta para saludar
router.post('/contracts', upload.single('file'),  odooContractCsv);
router.post('/billing', upload.single('file'),  odooBillingCsv); // Ruta para recibir el archivo CSV
// Ruta para revisar contenido de CSV
export default router;
