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
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', String(category));
    formData.append('csv_file', file, fileName);

    // Log campos del formData (no el contenido del archivo, pero sí los nombres)
    console.log("Hora del envio:", new Date().toISOString());
    console.log('Campos en formData:', formData.getBuffer ? Object.keys(formData.getHeaders()) : 'No disponible');
    console.log('Título:', title);
    console.log('Categoría:', category);
    console.log('Nombre de archivo:', fileName);
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
    if ('path' in file && typeof (file as any).path === 'string') {
      const fs = require('fs');
      try {
        const stats = fs.statSync((file as any).path);
        console.log('Tamaño del archivo a enviar:', stats.size, 'bytes');
      } catch (err) {
        console.warn('No se pudo obtener el tamaño del archivo:', err.message);
      }
    } else {
      console.warn('No se puede determinar el tamaño del archivo (no es un stream de archivo)');
    }

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