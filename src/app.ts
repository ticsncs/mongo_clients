import express, { Request, Response } from "express";
import { connectDB } from "./config/db-conection";
import dataRoutesCSV from "./routes/csv.routes";
import dataRoutesExcel from "./routes/excel.routes"; // Cambia esto si tienes rutas diferentes para Excel
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cors());
app.use("/api/csv", dataRoutesCSV);
app.use("/api/excel", dataRoutesExcel); // Cambia esto si tienes rutas diferentes para Excel

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
