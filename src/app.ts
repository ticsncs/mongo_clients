import express, { Request, Response } from "express";
import { connectDB } from "./config/db-conection";
import dataRoutes from "./routes/excel.routes";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use(cors());
app.use("/api", dataRoutes);

app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
});
