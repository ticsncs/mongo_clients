import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    contrato: string,
    fechaPago: string, // Nuevo campo
    diario: string,
    cliente: string,
    importe: string,
    estado: string,
}

const PaymentSchema: Schema = new Schema({
    contrato: { type: String, required: true },
    fechaPago: { type: String, required: true }, // Nuevo campo
    diario: { type: String, required: true },
    cliente: { type: String },
    importe: { type: String },
    estado: { type: String },

}, {
    timestamps: true,
    versionKey: false,
});

export const PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema) as any;
export default PaymentModel;
