import { Request, Response } from 'express';
import { BillingService } from '../services/billing.service';

import {  errorResponse } from '../utils/response';


const billingService = new BillingService();

export const uploadFacturas = async (req: Request, res: Response) => {
  try {
    const archivo = req.file;

    console.log('🚀 Iniciando procesamiento de facturas con', archivo);
    if (!archivo) {

        errorResponse(res, 404, '❌ No se propocionaron archivo');
    }

    await billingService.procesarArchivoFacturacion(archivo.path);

    res.status(200).json({ mensaje: 'Archivo procesado correctamente' });
  } catch (error: any) {
    errorResponse(res, 404,'❌ Error al procesar facturación:');

    res.status(500).json({ mensaje: 'Error al procesar facturación', error: error.message });
  }
};
