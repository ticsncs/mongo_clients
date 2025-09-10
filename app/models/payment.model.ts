import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    contrato: string,
    fechaPago: string,
    diario: string,
    cliente: string,
    importe: string,
    estado: string,
    procesado: boolean, // Nuevo campo para tracking de procesamiento
}

const PaymentSchema: Schema = new Schema({
    contrato: { type: String, required: true },
    fechaPago: { type: String, required: true },
    diario: { type: String, required: true },
    cliente: { type: String },
    importe: { type: String },
    estado: { type: String },
    procesado: { type: Boolean, default: false }, // Por defecto no procesado

}, {
    timestamps: true,
    versionKey: false,
});

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema) as any;
export default PaymentModel;
