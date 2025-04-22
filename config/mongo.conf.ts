import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || '';

/**
 * Conecta a la base de datos MongoDB.
 */
export const mongoConnect = async (): Promise<void> => {
  if (!MONGO_URI) {
    throw new Error('La URI de conexión a MongoDB no está definida');
  }

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: 'bd_clientes', // Nombre de la base de datos
      autoIndex: true, // Crear índices automáticamente
      maxPoolSize: 20, // Número máximo de conexiones en el pool
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw error;
  }
};

/**
 * Desconecta de la base de datos MongoDB.
 */
export const mongoDisconnect = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  } catch (error) {
    console.error('Error al desconectar de MongoDB:', error);
    throw error;
  }
};

export const db = mongoose.connection;
