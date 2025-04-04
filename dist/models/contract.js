"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratoModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ContratoSchema = new mongoose_1.default.Schema({
    codigo: { type: String, required: true, unique: true },
    servicio_internet: { type: String, required: true },
    plan_internet: { type: String, required: true },
    estado_ct: { type: String, required: true },
    cliente: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Cliente", required: true }
}, { timestamps: true });
exports.ContratoModel = mongoose_1.default.model("Contrato", ContratoSchema);
