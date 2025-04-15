import { Request, Response } from "express";

import { ClienteModel } from "../models/client";
import { readCSVAndSaveOptimized, checkCSVContent } from "../services/csv.service";
import { logger } from "../app"; // Importa el logger que configuramos anteriormente

// Verificar CSV
export const verifyCSV = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const result = await checkCSVContent(filename);
    res.status(result.exists ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({
      message: "❌ Error al verificar el archivo CSV",
      error: error.message,
    });
  }
};


// Procesar CSV (método optimizado)
export const processCSVOptimized = async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const result = await readCSVAndSaveOptimized(filename);
    res.status(result.exists === false ? 404 : 200).json(result);
    console.log("Resultado de la consulta", result.resumen)

  } catch (error) {
    res.status(500).json({
      message: "❌ Error al procesar el archivo CSV",
      error: error.message,
    });
  }
};


export const getDetailsJson = async (req: Request, res: Response) => {
  try {
    // Opciones de paginación
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Contar total de documentos para paginación
    const totalClients = await ClienteModel.countDocuments();
    
    // Obtener clientes con paginación y población selectiva
    const clientes = await ClienteModel.find()
      .select('nombre teléfono correo') // Seleccionar solo campos necesarios
      .populate({
        path: 'contratos',
        select: 'código plan_internet estado_ct forma_pago fecha_act fecha_corte' // Seleccionar solo campos necesarios de contratos
      })
      .skip(skip)
      .limit(limit)
      .lean(); // Usar lean() para mejor rendimiento

    // Calcular información de paginación
    const totalPages = Math.ceil(totalClients / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      clientes,
      paginacion: {
        totalClientes: totalClients,
        clientesMostrados: clientes.length,
        totalPaginas: totalPages,
        paginaActual: page,
        siguientePagina: hasNextPage ? page + 1 : null,
        paginaAnterior: hasPrevPage ? page - 1 : null
      },
      message: `Se han obtenido ${clientes.length} de ${totalClients} clientes en la consulta (página ${page} de ${totalPages})`
    });
  } catch (error) {
    // Logging detallado del error
    logger.error(`Error al obtener detalles de clientes: ${error.message}`, { error });
    
    res.status(500).json({ 
      message: "❌ Error al obtener los datos de clientes", 
      error: error.message 
    });
  }
};



// Obtiene la info de un cliente por correo o teléfono
export const get_data_client = async (req: Request, res: Response) => {
  try {
    const correo = req.params.correo; // ✅ Extraer solo el string
    const telefono = req.params.telefono; // ✅ Extraer solo el string

    // Buscar cliente que tenga el correo o el teléfono vinculados
    const cliente = await ClienteModel.findOne({
      $or: [{ correo:correo }, { teléfono: telefono }]
    })
    .select("nombre teléfono correo contratos")
    .populate({
      path: "contratos",
      select: "código plan_internet estado_ct forma_pago fecha_act fecha_corte",
    })
    .lean();

    console.log("Cliente encontrado", cliente)
    if (!cliente) {
      res.status(404).json({
        message: "❌ Cliente no encontrado",
      });
      return;
    }

    res.status(200).json({
      cliente,
      message: "✅ Cliente encontrado",
    });
  
  }
  catch (error) {
    res.status(500).json({
      message: "❌ Error al obtener los datos del cliente",
      error: error.message,
    });
  }
};

