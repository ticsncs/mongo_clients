import axios from 'axios';
import FormData from 'form-data'; // 👈 importante: esta es la de Node.js, no del navegador
import dotenv from 'dotenv';
import fs from 'fs'; // Para leer el contenido del archivo CSV
dotenv.config();

interface UploadCSVParams {
  title: string;
  category: string | number;
  file: NodeJS.ReadableStream; // ⬅ compatible con fs.createReadStream()
  fileName: string; // ⬅ necesario para que el servidor reconozca el archivo
}


export const uploadCSVFile = async ({
  title,
  category,
  file,
  fileName,
}: UploadCSVParams): Promise<any> => {
  try {
    console.log('🚀 Iniciando uploadCSVFile para:', fileName);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', String(category));
    formData.append('csv_file', file, fileName);

    // Log campos del formData (no el contenido del archivo, pero sí los nombres)
    console.log("\n📤 DETALLES DEL ENVÍO:");
    console.log("⏰ Hora del envio:", new Date().toISOString());
    console.log('📋 Campos en formData:', formData.getBuffer ? Object.keys(formData.getHeaders()) : 'No disponible');
    console.log('📝 Título:', title);
    console.log('🏷️ Categoría:', category);
    console.log('📁 Nombre de archivo:', fileName);
    // Imprime el contenido del archivo CSV (solo si es un stream de archivo)
    if ('path' in file && typeof (file as any).path === 'string') {
      try {
      const content = fs.readFileSync((file as any).path, 'utf8');
      console.log("Contenido del archivo:\n", content);
      } catch (err) {
      console.warn('No se pudo leer el contenido del archivo:', err.message);
      }
    } else {
      console.warn('No se puede imprimir el contenido del archivo (no es un stream de archivo)');
    }

    // Log tamaño del archivo si es posible
          // Validar que el archivo tiene más de una fila antes de enviarlo
          let fileHasMoreThanOneRow = false;
          if ('path' in file && typeof (file as any).path === 'string') {
            const fs = require('fs');
            try {
              console.log('\n📊 VALIDACIÓN DE ARCHIVO:');
              console.log('📂 Ruta del archivo:', (file as any).path);
              const content = fs.readFileSync((file as any).path, 'utf8');
              const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
              if (lines.length > 1) {
                fileHasMoreThanOneRow = true;
              }
              console.log('📈 Cantidad de filas en el archivo:', lines.length);
              console.log('📄 Primeras 3 líneas:', lines.slice(0, 3));
            } catch (err) {
              console.warn('No se pudo leer el archivo para validar filas:', err.message);
            }
          } else {
            console.warn('No se puede determinar el número de filas del archivo (no es un stream de archivo)');
          }

          if (!fileHasMoreThanOneRow) {
            console.warn('⚠️ ADVERTENCIA: El archivo no tiene más de una fila. No se enviará la petición.');
            console.log('❌ Abortando envío para:', fileName);
            return { error: 'El archivo no tiene más de una fila. No se envió la petición.' };
          }

          console.log('\n📡 PREPARANDO ENVÍO:');
    const baseUrl = process.env.API_APP_NETTPLUS;
    const endpoint = `${baseUrl}/clients/masspointsload/`;
    console.log('Enviando petición a:', endpoint);

    const token = process.env.API_TOKEN;
    console.log('Token:', token);
    if (!token) {
      throw new Error('⚠️ API_TOKEN no está definido en el archivo .env');
    }

    let response;
    try {
      response = await axios.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Token ${token}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log('Respuesta completa:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      });
    } catch (err) {
      if (err.response) {
        console.error('Error en la respuesta del servidor:', {
          status: err.response.status,
          data: err.response.data,
        });
      } else if (err.request) {
        console.error('No hubo respuesta del servidor. Request:', err.request);
      } else {
        console.error('Error al configurar la petición:', err.message);
      }
      throw err;
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Error al subir el archivo:', error.message);
    throw error;
  }
};