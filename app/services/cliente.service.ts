import { ClienteModel } from '../models/client.model';
import { ICliente } from '../models/client.model';

export class ClienteService {
  async getClientes(): Promise<ICliente[]> {
    try {
      const clientes: ICliente[] = await ClienteModel.find().lean();
      console.log('Clientes obtenidosasdasdasdas:', clientes);
      return clientes;
    } catch (error: any) {
      throw new Error('Error al obtener los clientes: ' + error.message);
    }
  }

  async addClient(clienteData: Pick<ICliente, 'nombre' | 'correo' | 'telefono'>): Promise<ICliente> {
    try {
      const updated = await ClienteModel.findOneAndUpdate(
        { correo: clienteData.correo },
        {
          $set: {
            nombre: clienteData.nombre,
            telefono: clienteData.telefono,
          },
        },
        {
          upsert: true,               // Crea si no existe
          new: true,                  // Devuelve el documento actualizado
          setDefaultsOnInsert: true,
        }
      ).lean();

      return updated as ICliente;
    } catch (error: any) {
      throw new Error('Error al agregar o actualizar el cliente: ' + error.message);
    }
  }


  async buscarClientePorCorreoOTelefono(correo: string, telefono: string): Promise<ICliente | null> {
    try {
      const cliente = await ClienteModel.findOne({
        $or: [{ correo }, { telefono }],
      })
      .select('nombre telefono correo contratos')
      .populate({
        path: 'contratos',
        select: 'codigo plan_internet estado_ct forma_pago fecha_act fecha_corte',
      })
      .lean();

      return cliente;
    } catch (error: any) {
      throw new Error(`Error al buscar cliente: ${error.message}`);
    }
  }

  async actualizarTelefonoCliente(id: string, nuevoTelefono: string): Promise<ICliente | null> {
    try {
      const cliente = await ClienteModel.findById(id);  
      const clienteActualizado = await ClienteModel.findOneAndUpdate(
        { _id: id },
        { $set: { telefono: nuevoTelefono } },
        { new: true, runValidators: true }
      ).lean();
      return clienteActualizado;
    } catch (error: any) {
      throw new Error(`Error al actualizar el teléfono del cliente: ${error.message}`);
    }
  }

}
