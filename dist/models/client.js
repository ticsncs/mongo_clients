"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ClienteSchema = new mongoose_1.default.Schema({
    nombre: { type: String, required: true },
    telefono: { type: String, required: true },
    contratos: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Contrato" }],
}, { timestamps: true });
exports.ClienteModel = mongoose_1.default.model("Cliente", ClienteSchema);
