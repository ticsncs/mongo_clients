"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExcelAndSave = void 0;
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const client_1 = require("../models/client");
const contract_1 = require("../models/contract");
const readExcelAndSave = async (filename) => {
    try {
        const filePath = path_1.default.join(__dirname, "../utils", filename);
        console.log(filePath);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        for (const row of jsonData) {
            //console.log("Estas son las row", row)
            // Buscar o crear cliente
            //console.log("Encabezados en Excel:", Object.keys(row));
            let cliente = await client_1.ClienteModel.findOne({ telefono: row["Teléfono"] });
            if (!cliente) {
                cliente = new client_1.ClienteModel({
                    nombre: row["Cliente"] || "undefined",
                    telefono: row["Teléfono"] || "undefined",
                    contratos: []
                });
                await cliente.save();
            }
            // Crear contrato
            const contrato = new contract_1.ContratoModel({
                codigo: row["Código"],
                plan_internet: row["Plan Internet"] || "undefined",
                servicio_internet: row["Servicio Internet"] || "undefined",
                //fecha_inicio: new Date(row["Fecha Inicio"]),
                estado_ct: row["Estado CT"] || "undefined",
                cliente: cliente._id
            });
            await contrato.save();
            // Agregar referencia al cliente
            cliente.contratos.push(contrato._id);
            await cliente.save();
        }
        return { message: "✅ Datos guardados correctamente en MongoDB" };
    }
    catch (error) {
        console.error("❌ Error procesando el archivo Excel:", error);
        return { message: "❌ Error al procesar el archivo" };
    }
};
exports.readExcelAndSave = readExcelAndSave;
