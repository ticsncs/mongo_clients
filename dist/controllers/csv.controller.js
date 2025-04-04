"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetailClient = exports.getDetailsJson = exports.checkCSV = exports.uploadCSVData = void 0;
const csv_service_1 = require("../services/csv.service");
const client_1 = require("../models/client");
// Nuevo método para CSV
const uploadCSVData = async (req, res) => {
    try {
        const { filename } = req.params;
        console.log("Nombre del archivo:", filename);
        // Si todo está bien, procedemos a guardar
        const result = await (0, csv_service_1.readCSVAndSave)(filename);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "❌ Error en el servidor", error });
    }
};
exports.uploadCSVData = uploadCSVData;
// Función para verificar CSV
const checkCSV = async (req, res) => {
    try {
        const { filename } = req.params;
        const result = await (0, csv_service_1.checkCSVContent)(filename);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: "❌ Error en el servidor", error });
    }
};
exports.checkCSV = checkCSV;
const getDetailsJson = async (req, res) => {
    try {
        const clientes = await client_1.ClienteModel.find().populate("contratos");
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
// Corregido el tipo para evitar errores de TypeScript
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
