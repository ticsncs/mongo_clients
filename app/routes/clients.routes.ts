import { Router } from 'express';

import { getClientes, get_data_client, updateTelefonoCliente } from '../controllers/cliente.controller'; // ✅ correcto

const router = Router();

// Define aquí tus rutas
router.get('/', getClientes); // ✅ correcto
// 📊 Ruta para obtener datos de cliente
router.get("/get/data/:correo", get_data_client);
// ruta para actualizar el teléfono de un cliente
router.put("/update/:id", updateTelefonoCliente);

export default router;
