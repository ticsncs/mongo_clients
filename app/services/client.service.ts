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

  private ClienteModel: any;



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
        select: 'codigo plan_internet estado_ct forma_pago fecha_act fecha_corte servicio_internet monto_deuda',
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


  async getClientesByEmails(emails: string[]): Promise<Record<string, string>> {
    if (!emails.length) return {};
    
    // Filtrar correos vacíos o no válidos
    const validEmails = emails.filter(email => email && typeof email === 'string');
    
    try {
      // Buscar todos los clientes que coincidan con los correos
      const clientes = await this.ClienteModel.find({
        correo: { $in: validEmails }
      }).select('correo _id').lean();
      
      // Crear un mapa de correo -> id
      const emailToIdMap: Record<string, string> = {};
      for (const cliente of clientes) {
        emailToIdMap[cliente.correo] = cliente._id.toString();
      }
      
      return emailToIdMap;
    } catch (error) {
      console.error('Error al obtener clientes por correo:', error);
      return {};
    }
  }

  async bulkUpsertClientes(clientes: any[]): Promise<Array<{correo: string, id: string}>> {
    if (!clientes.length) return [];
    
    // Filtrar datos inválidos
    const validClientes = clientes.filter(c => c.correo);
    
    if (!validClientes.length) return [];
    
    try {
      // Preparar operaciones de bulkWrite
      const bulkOps = validClientes.map(cliente => ({
        updateOne: {
          filter: { correo: cliente.correo },
          update: { $set: {
            nombre: cliente.nombre || '',
            cedula: cliente.cedula || '',
            telefono: cliente.telefono || '',
            // Añadir fecha de actualización
            updatedAt: new Date()
          }},
          upsert: true // Crear si no existe
        }
      }));
      
      // Ejecutar operaciones en lote
      const result = await this.ClienteModel.bulkWrite(bulkOps);
      
      // Recuperar los IDs de los documentos afectados
      // Nota: Esto es específico para MongoDB/Mongoose
      const insertedIds = result.upsertedIds || {};
      
      // Obtener los IDs de los documentos que fueron actualizados o insertados
      // Necesitamos buscar los IDs de los actualizados ya que bulkWrite no los devuelve directamente
      const emailsToQuery = validClientes.map(c => c.correo);
      const clienteMap = await this.getClientesByEmails(emailsToQuery);
      
      // Construir el resultado
      return validClientes.map(cliente => ({
        correo: cliente.correo,
        id: clienteMap[cliente.correo] || ''
      })).filter(result => result.id); // Filtrar los que no tengan ID
    } catch (error) {
      console.error('Error en bulkUpsertClientes:', error);
      
      // Si falla el bulkWrite, podemos intentar un enfoque más lento pero más seguro
      const results: Array<{correo: string, id: string}> = [];
      
      // Procesar uno por uno en caso de error con bulkWrite
      for (const cliente of validClientes) {
        try {
          const result = await this.upsertCliente(cliente);
          if (result) {
            results.push({ correo: cliente.correo, id: result });
          }
        } catch (individualError) {
          console.error(`Error al procesar cliente ${cliente.correo}:`, individualError);
        }
      }
      
      return results;
    }
  } 
}



