import express, { Request, Response, NextFunction } from "express";
import { connectDB } from "./config/db-conection";
import dataRoutesCSV from "./routes/csv.routes";
import dataRoutesExcel from "./routes/excel.routes";
import cors from "cors";
import morgan from "morgan";
import winston from "winston";
import { v4 as uuidv4 } from "uuid";

// Configuración de Winston para logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-server' },
  transports: [
    // - Write all logs with importance level of 'error' or less to 'error.log'
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // - Write all logs with importance level of 'info' or less to 'combined.log'
    new winston.transports.File({ filename: 'logs/combined.log' }),
    // Console logs para desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware para asignar un ID único a cada petición
const requestIdMiddleware = (req: Request & { id?: string }, res: Response, next: NextFunction) => {
  req.id = uuidv4();
  next();
};

// Middleware para registrar detalles de la petición
const requestLoggerMiddleware = (req: Request & { id?: string }, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capturar el body si existe (para peticiones POST, PUT, etc.)
  const reqBody = req.body ? JSON.stringify(req.body) : '';
  
  // Registrar cuando la petición comienza
  logger.info({
    message: `Request started: ${req.method} ${req.originalUrl}`,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  // Capturar cuando la respuesta termina
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      message: `Request completed: ${req.method} ${req.originalUrl}`,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length')
    });
  });
  
  next();
};

// Middleware para manejo de errores
const errorHandlerMiddleware = (err: Error, req: Request & { id?: string }, res: Response, next: NextFunction) => {
  logger.error({
    message: `Error: ${err.message}`,
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    error: err.stack
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id
  });
};

const app = express();
const PORT = process.env.PORT || 3000;

// Asegúrate de que el directorio de logs existe
const fs = require('fs');
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Conectar a la base de datos
connectDB();

// Middlewares globales
app.use(express.json());
app.use(cors());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

// Morgan para logs de HTTP (formato personalizado)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message: string) => logger.http(message.trim())
  }
}));

// Rutas de la API
app.use("/api/csv", dataRoutesCSV);
app.use("/api/excel", dataRoutesExcel);

// Ruta para verificar el estado del servidor
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  logger.warn({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    method: req.method,
    url: req.originalUrl
  });
  
  res.status(404).json({ error: 'Route not found' });
});

// Middleware de manejo de errores (debe ser el último middleware)
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  logger.info(`✅ Servidor de API activo en el puerto: ${PORT}`);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

export { logger };