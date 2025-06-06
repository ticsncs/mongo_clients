import { Request, Response } from 'express';
import { ClientService } from '../services/client.service';
import { successResponse, errorResponse } from '../utils/response';

const clienteService = new ClientService();

export const getClientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const clientes = await clienteService.getClientes();
    successResponse(res, 200, '✅ Clientes obtenidos', clientes);
  } catch (error: any) {
    errorResponse(res, 500, '❌ Error al obtener clientes', error);
  }
};


// Obtiene la info de un cliente por correo o teléfono

export const get_data_client = async (req: Request, res: Response) => {
  const { correo } = req.params;
  console.log(correo)
  try {
    const cliente = await clienteService.buscarClientePorCorreo(correo);
    
    console.log(cliente)
    if (!cliente) {
      errorResponse(res, 404, '❌ Cliente no encontrado');
    }

    successResponse(res, 200, '✅ Cliente encontrado', cliente);
  } catch (error: any) {
    errorResponse(res, 500, '❌ Error al buscar cliente', error);
  }
};


export const updateTelefonoCliente = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { telefono } = req.body;
  try {
    const clienteActualizado = await clienteService.actualizarTelefonoCliente(id, telefono);

    if (!clienteActualizado) {
      errorResponse(res, 404, '❌ Cliente no encontrado');
      return;
    }

    successResponse(res, 200, '✅ Teléfono del cliente actualizado', clienteActualizado);
  } catch (error: any) {
    errorResponse(res, 500, '❌ Error al actualizar teléfono del cliente', error);
  }
};


// Nueva función bulk
export const verificarClientesPorCorreoBulk = async (req: Request, res: Response): Promise<void> => {
  const { emails } = req.body;

  if (!Array.isArray(emails) || emails.length === 0) {
    errorResponse(res, 400, '❌ Se requiere un array de correos');
    return;
  }

  // Sanitizar y validar correos
  const sanitizedEmails = emails
    .map(email => email.toString().toLowerCase().trim())
    .filter(email => {
      // Expresión regular para validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    });

  if (sanitizedEmails.length === 0) {
    errorResponse(res, 400, '❌ No hay correos válidos para verificar');
    return;
  }

  try {
    const clientes = await clienteService.buscarClientesPorCorreos(sanitizedEmails);
    const existentes = clientes.map(c => c.correo.toLowerCase());
    const resultado = Object.fromEntries(
      sanitizedEmails.map(email => [email, existentes.includes(email)])
    );
    successResponse(res, 200, '✅ Verificación completada', resultado);
  } catch (error: any) {
    errorResponse(res, 500, '❌ Error al verificar correos', error);
  }
};
