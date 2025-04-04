"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_conection_1 = require("./config/db-conection");
const csv_routes_1 = __importDefault(require("./routes/csv.routes"));
const excel_routes_1 = __importDefault(require("./routes/excel.routes")); // Cambia esto si tienes rutas diferentes para Excel
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
(0, db_conection_1.connectDB)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/csv", csv_routes_1.default);
app.use("/api/excel", excel_routes_1.default); // Cambia esto si tienes rutas diferentes para Excel
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
