import * as fs from "fs";
import * as path from "path";
import { ClienteModel } from "../models/client";
import { ContratoModel } from "../models/contract";

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
        'Estado CT': valores[5] || 'Desconocido'
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
                          primeraLinea.includes('teléfono');
  
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
      'Plan Internet': planInternetLimpio,
      'Servicio Internet': servicioInternetLimpio,
      'Estado CT': estadoCTLimpio
    };
    
    resultados.push(resultado);
  }
  
  return resultados;
};

// Leer el CSV y guardar en la BD
// Leer el CSV y guardar en la BD
export const readCSVAndSave = async (filename: string) => {
  try {
    const robotFilesPath = '/home/proyectos/Robots/Files';
    const filePath = path.join(robotFilesPath, filename);

    if (!fs.existsSync(filePath)) {
      return { message: "❌ El archivo no existe", exists: false };
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    
    // Usar el nuevo parser que detecta automáticamente el formato
    const jsonData = parseCSVMultiFormato(fileContent);

    if (jsonData.length === 0) {
      return { message: "⚠️ El archivo CSV está vacío o tiene un formato incorrecto", exists: true };
    }

    let clientesCreados = 0;
    let contratosCreados = 0;
    let filasSaltadas = 0;
    let clientesActualizados = 0;

    for (const row of jsonData) {
      // Obtener valores de las columnas (ahora correctamente organizadas)
      const codigoContrato = row["Código"];
      const nombre = row["Cliente"];
      const telefono = row["Teléfono"];
      const planInternet = row["Plan Internet"];
      const servicioInternet = row["Servicio Internet"];
      const estadoCT = row["Estado CT"];

      // Modificación aquí: verificar solo el código de contrato
      if (!codigoContrato) {
        console.warn("⚠️ Fila inválida. Falta código del contrato:", row);
        filasSaltadas++;
        continue;
      }

      // Limpiar los datos antes de guardarlos
      // Si el teléfono está vacío, asignar "000000000"
      const telefonoLimpio = telefono ? limpiarTelefono(telefono) : "000000000";
      const nombreLimpio = limpiarNombre(nombre || "Sin Nombre");

      // Buscar cliente existente
      let cliente = await ClienteModel.findOne({ telefono: telefonoLimpio });

      if (!cliente) {
        cliente = new ClienteModel({
          nombre: nombreLimpio,
          telefono: telefonoLimpio, // Ya tenemos el valor predeterminado si es vacío
          contratos: [],
        });

        await cliente.save();
        clientesCreados++;
      } else if (cliente.nombre !== nombreLimpio && nombreLimpio !== "Sin Nombre") {
        cliente.nombre = nombreLimpio;
        await cliente.save();
        clientesActualizados++;
      }

      // Evitar duplicados de contratos
      const contratoExistente = await ContratoModel.findOne({ codigo: codigoContrato });

      if (!contratoExistente) {
        const nuevoContrato = new ContratoModel({
          codigo: codigoContrato,
          plan_internet: planInternet,
          servicio_internet: servicioInternet,
          estado_ct: estadoCT,
          cliente: cliente._id,
        });

        await nuevoContrato.save();
        contratosCreados++;

        cliente.contratos.push(nuevoContrato._id);
        await cliente.save();
      }
    }

    return { 
      message: "✅ Datos guardados correctamente en MongoDB",
      resumen: {
        clientesCreados,
        clientesActualizados,
        contratosCreados,
        filasSaltadas,
        totalFilas: jsonData.length
      }
    };
  } catch (error) {
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