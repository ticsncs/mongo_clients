import { Client } from 'socket.io/dist/client';
import { ClienteModel } from '../models/client.model';
import { ICliente } from '../models/client.model';
interface ClienteDTO {
  correo: string;
  nombre?: string;
  cedula?: string;
  telefono?: string;
}

export class ClientService {
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

  async upsertCliente(data: ClienteDTO): Promise<string> {
    const { correo, nombre, cedula, telefono } = data;
    const updateData: any = { nombre, telefono };

    let cliente;

    if (cedula) {
      cliente = await ClienteModel.findOne({ cedula });

      if (cliente) {
        // Si la cédula existe ➝ actualizamos ese cliente
        cliente.set(updateData);
        await cliente.save();
        return cliente._id.toString();
      }
    }

    // Si no existe la cédula ➝ buscamos por correo
    if (cedula) updateData.cedula = cedula;

    cliente = await ClienteModel.findOneAndUpdate(
      { correo },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!cliente) throw new Error(`No se pudo guardar cliente con correo ${correo}`);
    return cliente._id.toString();
  }
}



