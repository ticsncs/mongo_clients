import { Request, Response } from 'express';
import { ContractService } from '../services/contract.service';
import { successResponse, errorResponse } from '../utils/response';

const contractService = new ContractService();


export const updateFormaPago = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { formaPago } = req.body;
  
    try {
      console.log('🚀 Iniciando actualización de forma de pago');
      const contratoActualizado = await contractService.actualizarDatosContrato(id, {
        forma_pago: formaPago,
      });
  
      if (!contratoActualizado) {
        errorResponse(res, 404, '❌ Contrato no encontrado');
      }
  
      successResponse(res, 200, '✅ Forma de pago actualizada', contratoActualizado);
    } catch (error: any) {
      errorResponse(res, 500, '❌ Error al actualizar forma de pago del cliente', error);
    }
  };
  

  export const updatePlanInternet = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { planInternet } = req.body;
  
    try {
      console.log('🚀 Iniciando actualización del plan de internet');
      const contratoActualizado = await contractService.actualizarDatosContrato(id, {
        plan_internet: planInternet,
      });
  
      if (!contratoActualizado) {
        errorResponse(res, 404, '❌ Contrato no encontrado');
      }
  
      successResponse(res, 200, '✅ Plan de Internet actualizado', contratoActualizado);
    } catch (error: any) {
      errorResponse(res, 500, '❌ Error al actualizar plan de internet', error);
    }
  };
  