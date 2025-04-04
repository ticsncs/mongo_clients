"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetailClient = exports.getDetailsJson = exports.uploadExcelData = void 0;
const excel_service_1 = require("../services/excel.service");
const client_1 = require("../models/client");
const uploadExcelData = async (req, res) => {
    try {
        const { filename } = req.params;
        const result = await (0, excel_service_1.readExcelAndSave)(filename);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "❌ Error en el servidor", error });
    }
};
exports.uploadExcelData = uploadExcelData;
const getDetailsJson = async (req, res) => {
    try {
        const clientes = await client_1.ClienteModel.find().populate("contratos"); // Relacionar clientes con contratos
        res.json({
            clientes: clientes,
            message: `Se han obtenido: ${clientes.length} en la consulta`
        });
    }
    catch (error) {
        res.status(500).json({ message: "❌ Error en el servidor", error });
    }
};
exports.getDetailsJson = getDetailsJson;
const getDetailClient = async (req, res) => {
    const { searchPhone } = req.body;
    try {
        const cliente = await client_1.ClienteModel.findOne({ telefono: searchPhone });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        return res.json({
            cliente: cliente,
            message: "Cliente encontrado"
        });
    }
    catch (error) {
        return res.status(500).json({ message: "❌ Error en el servidor", error });
    }
};
exports.getDetailClient = getDetailClient;
