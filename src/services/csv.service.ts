import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import { ClienteModel } from "../models/client";
import { ContratoModel } from "../models/contract";
import { logger } from "../app"; // Importa el logger que configuramos anteriormente

// Verificar el contenido del CSV sin guardarlo
export const checkCSVContent = async (filename: string) => {
  try {
    const filePath = path.join(__dirname, "../utils", filename);

    if (!fs.existsSync(filePath)) {
      return { message: "❌ El archivo no existe", exists: false };
    }

    // Leer archivo CSV
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Determinar el formato y parsear el CSV
    const jsonData = parseCSVMultiFormato(fileContent);

    if (jsonData.length === 0) {
      return { message: "⚠️ El archivo CSV está vacío o tiene un formato incorrecto", exists: true };
    }

    return {
      message: "✅ Archivo CSV leído correctamente",
      rows: jsonData.length,
      firstRow: jsonData[0],
      headers: ["Código", "Cliente", "Teléfono", "Plan Internet", "Servicio Internet", "Estado CT"],
      exists: true,
    };
  } catch (error) {
    return {
      message: "❌ Error al procesar el archivo",
      error: error.message,
      exists: true,
    };
  }
};


// Leer el CSV y guardar en la BD con optimizaciones
// Leer el CSV y guardar en la BD con limpieza previa
export const readCSVAndSaveOptimized = async (filename: string) => {
  try {
    const startTime = Date.now();
    logger.info(`Iniciando procesamiento del archivo ${filename}`);
    
    const robotFilesPath = '/home/proyectos/Robots/Files';
    const filePath = path.join(robotFilesPath, filename);

    if (!fs.existsSync(filePath)) {
      logger.error(`Archivo no encontrado: ${filePath}`);
      return { message: "❌ El archivo no existe", exists: false };
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    logger.info(`Archivo leído: ${filePath}, tamaño: ${fileContent.length} bytes`);
    
    // Usar el parser que detecta automáticamente el formato
    const jsonData = parseCSVMultiFormato(fileContent);

    if (jsonData.length === 0) {
      logger.warn(`El archivo CSV está vacío o tiene un formato incorrecto: ${filePath}`);
      return { message: "⚠️ El archivo CSV está vacío o tiene un formato incorrecto", exists: true };
    }

    logger.info(`CSV parseado correctamente. Total de filas: ${jsonData.length}`);

    // Extraer los teléfonos y códigos de contrato
    const telefonos = jsonData.map(row => limpiarTelefono(row["Teléfono"] || "000000000"));
    const codigosContrato = jsonData.map(row => row["Código"]);

    // NUEVO: Limpiar las colecciones antes de insertar nuevos datos
    logger.info(`Limpiando colecciones antes de insertar nuevos datos...`);
    
    // Limpiar contratos
    await ContratoModel.deleteMany({});
    logger.info(`Colección de contratos limpiada`);
    
    // Limpiar clientes
    await ClienteModel.deleteMany({});
    logger.info(`Colección de clientes limpiada`);

    // Preparar datos para inserción masiva
    const clientesNuevos = [];
    const contratosNuevos = [];
    const mapaTelefonoCliente = {}; // Para no duplicar clientes
    
    let clientesCreados = 0;
    let contratosCreados = 0;
    let filasSaltadas = 0;

    // Procesar los datos
    for (const row of jsonData) {
      const codigoContrato = row["Código"];
      const nombre = row["Cliente"];
      const telefono = row["Teléfono"];
      const correo = row["Cliente/Correo electrónico"];
      const planInternet = row["Plan Internet"];
      const servicioInternet = row["Servicio Internet"];
      const estadoCT = row["Estado CT"];

      // Verificar datos obligatorios
      if (!codigoContrato) {
        logger.warn(`Fila inválida. Falta código del contrato:`, row);
        filasSaltadas++;
        continue;
      }

      // Limpiar los datos
      const telefonoLimpio = telefono && telefono.trim() ? limpiarTelefono(telefono) : "000000000";
      const nombreLimpio = limpiarNombre(nombre || "Sin Nombre");
      const correoLimpio = correo ? correo.trim() : "";

      // Verificar si ya procesamos este cliente (por teléfono)
      let clienteId;
      if (!mapaTelefonoCliente[telefonoLimpio]) {
        // Es un cliente nuevo
        const nuevoClienteId = new mongoose.Types.ObjectId();
        clienteId = nuevoClienteId;
        
        clientesNuevos.push({
          _id: nuevoClienteId,
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
          correo: correo || "",
          contratos: [], // Se llenará después con los IDs de contratos
        });
        
        mapaTelefonoCliente[telefonoLimpio] = {
          id: nuevoClienteId,
          contratos: []
        };
        
        clientesCreados++;
      } else {
        clienteId = mapaTelefonoCliente[telefonoLimpio].id;
      }

      // Crear el nuevo contrato
      const nuevoContratoId = new mongoose.Types.ObjectId();
      contratosNuevos.push({
        _id: nuevoContratoId,
        codigo: codigoContrato,
        plan_internet: planInternet,
        servicio_internet: servicioInternet,
        estado_ct: estadoCT,
        cliente: clienteId
      });
      
      // Guardar relación para actualizar el arreglo de contratos del cliente
      mapaTelefonoCliente[telefonoLimpio].contratos.push(nuevoContratoId);
      
      contratosCreados++;
    }

    // Actualizar las referencias de contratos en los objetos de clientes
    for (const telefono in mapaTelefonoCliente) {
      const clienteInfo = mapaTelefonoCliente[telefono];
      
      // Buscar el cliente en el array de clientes nuevos
      const clienteIndex = clientesNuevos.findIndex(c => c._id.equals(clienteInfo.id));
      if (clienteIndex !== -1) {
        clientesNuevos[clienteIndex].contratos = clienteInfo.contratos;
      }
    }

    // Insertar datos en lotes
    logger.info(`Insertando ${clientesNuevos.length} clientes nuevos...`);
    await ClienteModel.insertMany(clientesNuevos);
    
    logger.info(`Insertando ${contratosNuevos.length} contratos nuevos...`);
    await ContratoModel.insertMany(contratosNuevos);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    logger.info(`Procesamiento completado en ${duration.toFixed(2)} segundos`);

    return { 
      message: "✅ Datos guardados correctamente en MongoDB",
      duracion: `${duration.toFixed(2)} segundos`,
      resumen: {
        clientesCreados,
        contratosCreados,
        filasSaltadas,
        totalFilas: jsonData.length,
        coleccionesLimpiadas: true // Indicar que se limpiaron las colecciones
      }
    };
  } catch (error) {
    logger.error(`Error al procesar el archivo CSV: ${error.message}`, { error });
    return { message: "❌ Error al procesar el archivo", error: error.message };
  }
};

// Función para limpiar el número de teléfono
const limpiarTelefono = (telefono: string): string => {
  // Eliminar caracteres no numéricos
  return telefono.replace(/\D/g, '');
};

// Función para limpiar el nombre del cliente
const limpiarNombre = (nombre: string): string => {
  // Eliminar múltiples espacios y limpiar
  return nombre.replace(/\s+/g, ' ').trim();
};

// Función que detecta y parsea múltiples formatos de CSV
const parseCSVMultiFormato = (contenidoCSV: string): Array<any> => {
  // Dividir en líneas
  const lineas = contenidoCSV.split('\n').filter(l => l.trim());
  
  // Verificar si es el formato 1 o formato 2
  const esFormato2 = lineas[0].includes(',""') || 
                      (lineas.length > 1 && lineas[1].includes(',""'));
  
  if (esFormato2) {
    return parseCSVFormato2(lineas);
  } else {
    return parseCSVFormato1(lineas);
  }
};

// Parser para el Formato 1 (simple CSV con valores en comillas dobles)
const parseCSVFormato1 = (lineas: string[]): Array<any> => {
  const resultados: Array<any> = [];
  
  // Determinar si hay encabezado
  const primeraLinea = lineas[0].toLowerCase();
  const tieneEncabezado = primeraLinea.includes('código') || 
                          primeraLinea.includes('cliente') || 
                          primeraLinea.includes('teléfono');
  
  // Índice de inicio (saltamos el encabezado si existe)
  const indiceInicio = tieneEncabezado ? 1 : 0;
  
  for (let i = indiceInicio; i < lineas.length; i++) {
    const linea = lineas[i].trim();
    if (!linea) continue;
    
    // Verificar si la línea contiene un código de contrato
    const codigoMatch = linea.match(/CT-\d+/);
    if (!codigoMatch) continue;
    
    // Parsear la línea usando regex para respetar las comillas
    const regex = /"([^"]*?)"/g;
    const matches = [...linea.matchAll(regex)];
    
    if (matches && matches.length >= 5) {
      // Extraer valores entre comillas
      const valores = matches.map(match => match[1].trim());
      
      // Procesar los valores
      const codigo = valores[0];
      
      // Extraer el nombre del cliente (puede tener un ID al principio)
      let nombreCliente = valores[1] || '';
      const clienteMatch = nombreCliente.match(/^(\d+)\s+(.+)$/);
      const nombreLimpio = clienteMatch ? clienteMatch[2].trim() : nombreCliente;
      
      const resultado = {
        'Código': codigo,
        'Cliente': nombreLimpio,
        'Teléfono': valores[2] || '',
        'Plan Internet': valores[3] || 'Desconocido',
        'Servicio Internet': valores[4] || 'Desconocido',
        'Estado CT': valores[5] || 'Desconocido',
        'Cliente/Correo electrónico': valores[6] || '',

      };
      
      resultados.push(resultado);
    }
  }
  
  return resultados;
};


// Parser para el Formato 2 (CSV con comillas anidadas)
const parseCSVFormato2 = (lineas: string[]): Array<any> => {
  const resultados: Array<any> = [];
  
  // Determinar si hay encabezado
  const primeraLinea = lineas[0].toLowerCase();
  const tieneEncabezado = primeraLinea.includes('código') || 
                          primeraLinea.includes('cliente') ||
                          primeraLinea.includes('teléfono') ||
                          primeraLinea.includes('cliente/correo electrónico');
  
  // Índice de inicio (saltamos el encabezado si existe)
  const indiceInicio = tieneEncabezado ? 1 : 0;
  
  for (let i = indiceInicio; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea.trim()) continue;
    
    // Extraer código de contrato
    const codigoMatch = linea.match(/CT-\d+/);
    if (!codigoMatch) continue;
    
    const codigo = codigoMatch[0];
    
    // Extraer las partes de la línea
    let valores: string[] = [];
    let valoresTomados = false;
    
    // Método 1: Extraer valores entre dobles comillas ""valor""
    const valoresConComillasMatch = linea.match(/""([^"]*)""(?:,|$)/g);
    
    if (valoresConComillasMatch && valoresConComillasMatch.length >= 5) {
      valores = valoresConComillasMatch.map(v => 
        v.replace(/^""|""$|,$|^,|"$/g, '').trim()
      );
      valoresTomados = true;
    }
    
    // Método 2: Intentar otro patrón si el método 1 falló
    if (!valoresTomados) {
      const restoDeLaLinea = linea.substring(linea.indexOf(codigo) + codigo.length);
      const partesMatch = restoDeLaLinea.match(/,""([^"]*)""/g) || [];
      
      if (partesMatch.length > 0) {
        valores = partesMatch.map(v => 
          v.replace(/^,""|""$|"$/g, '').trim()
        );
        valoresTomados = true;
      }
    }
    
    // Método 3: Intentar dividir por comillas simples
    if (!valoresTomados) {
      const restoDeLaLinea = linea.substring(linea.indexOf(codigo) + codigo.length);
      const partes = restoDeLaLinea.split(',');
      
      valores = partes.map(p => p.replace(/^"|"$|""$/g, '').trim());
    }
    
    // Procesar los nombres de cliente (extraer el nombre de la identificación)
    let nombreCliente = valores[0] || '';
    const clienteMatch = nombreCliente.match(/^(\d+)\s+(.+)$/);
    if (clienteMatch) {
      nombreCliente = clienteMatch[2].trim();
    }
    
    // Limpiar cualquier comilla adicional en los valores
    const telefonoLimpio = (valores[1] || '').replace(/"/g, '');
    const planInternetLimpio = (valores[2] || 'Desconocido').replace(/"/g, '');
    const servicioInternetLimpio = (valores[3] || 'Desconocido').replace(/"/g, '');
    const estadoCTLimpio = (valores[4] || 'Desconocido').replace(/"/g, '');
    
    const resultado = {
      'Código': codigo,
      'Cliente': nombreCliente.replace(/"/g, ''),
      'Teléfono': telefonoLimpio,
      'Cliente/Correo electrónico': valores[5] || '',
      'Plan Internet': planInternetLimpio,
      'Servicio Internet': servicioInternetLimpio,
      'Estado CT': estadoCTLimpio
    };
    
    resultados.push(resultado);
  }
  
  return resultados;
};