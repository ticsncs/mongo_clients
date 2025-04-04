"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const excel_controller_1 = require("../controllers/excel.controller");
const excel_controller_2 = require("../controllers/excel.controller");
const router = (0, express_1.Router)();
// Ruta para importar datos desde un Excel
router.post("/import/:filename", excel_controller_1.uploadExcelData);
router.get("/clients", excel_controller_2.getDetailsJson);
// La ruta debe coincidir con cómo recoges el parámetro
//router.post("/search", getDetailClient);
exports.default = router;
