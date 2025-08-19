import axios from 'axios';
import FormData from 'form-data'; // 👈 importante: esta es la de Node.js, no del navegador
import dotenv from 'dotenv';
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

    const baseUrl = process.env.API_APP_NETTPLUS ;
    const endpoint = `${baseUrl}/clients/masspointsload/`;
    console.log("Enviando petición a:", endpoint);

    const token = process.env.API_TOKEN;
    console.log(token)
if (!token) {
  throw new Error('⚠️ API_TOKEN no está definido en el archivo .env');
}

    const response = await axios.post(endpoint, formData, {
  headers: {
    ...formData.getHeaders(),
    Authorization: `Token ${token}`,
  },
});

    return response.data;
  } catch (error: any) {
    console.error('❌ Error al subir el archivo:', error.message);
    throw error;
  }
};