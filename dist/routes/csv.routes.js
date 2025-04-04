"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const csv_controller_1 = require("../controllers/csv.controller");
const csv_controller_2 = require("../controllers/csv.controller");
const router = (0, express_1.Router)();
// Ruta para importar datos desde un Excel
router.post("/import/:filename", csv_controller_1.uploadCSVData);
router.get("/clients", csv_controller_2.getDetailsJson);
// La ruta debe coincidir con cómo recoges el parámetro
//router.post("/search", getDetailClient);
exports.default = router;
