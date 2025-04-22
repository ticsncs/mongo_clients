import dotenv from 'dotenv';
import compression from 'compression';
import express, { Application, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import morganBody from 'morgan-body';
import { Writable } from 'stream';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import router from './app/routes/index';
import { mongoConnect } from './config/mongo.conf';
import { ClienteModel } from './app/models/client.model';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Ajusta según tu frontend
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/1.0/public', express.static(path.resolve('public')));
app.use('/api/1.0', router);

// Logger solo para errores >= 400
const loggerStream = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString().trim());
    callback();
  },
});
morganBody(app, {
  noColors: true,
  stream: loggerStream,
  skip: (req, res) => res.statusCode < 400,
});

// Errores globales
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error en el servidor:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message,
  });
});

// Socket.IO conexión
io.on('connection', (socket) => {
  console.log('🔗 Nuevo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Conexión a MongoDB y servidor
mongoConnect()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });

    // Activar middlewares con Socket.IO
    ClienteModel.watchInsertUpdateDelete(io);
  })
  .catch((error) => {
    console.error('❌ Error al iniciar el servidor:', error);
  });
