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

    // Parsear manualmente el CSV debido al formato especial
    const jsonData = parseCSVRobusto(fileContent);

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

// Función robusta para parsear el CSV con dobles comillas
const parseCSVRobusto = (contenidoCSV: string): Array<any> => {
  // Dividir en líneas
  const lineas = contenidoCSV.split('\n').filter(l => l.trim());
  
  // Ignorar la primera línea (cabecera)
  const resultados: Array<any> = [];
  
  for (let i = 1; i < lineas.length; i++) {
    const linea = lineas[i];
    
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
export const readCSVAndSave = async (filename: string) => {
  try {
    const robotFilesPath = '/home/proyectos/Robots/Files';
    const filePath = path.join(robotFilesPath, filename);

    if (!fs.existsSync(filePath)) {
      return { message: "❌ El archivo no existe", exists: false };
    }

    const fileContent = fs.readFileSync(filePath, "utf8");
    
    // Parsear manualmente el CSV
    const jsonData = parseCSVRobusto(fileContent);

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

      if (!telefono || !codigoContrato) {
        console.warn("⚠️ Fila inválida. Falta teléfono o código del contrato:", row);
        filasSaltadas++;
        continue;
      }

      // Limpiar los datos antes de guardarlos
      const telefonoLimpio = limpiarTelefono(telefono);
      const nombreLimpio = limpiarNombre(nombre || "Sin Nombre");

      // Buscar cliente existente
      let cliente = await ClienteModel.findOne({ telefono: telefonoLimpio });

      if (!cliente) {
        cliente = new ClienteModel({
          nombre: nombreLimpio,
          telefono: telefonoLimpio,
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