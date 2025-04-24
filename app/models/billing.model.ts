import mongoose, { Schema, Document } from 'mongoose';

export interface IBilling extends Document {
  id_contrato: mongoose.Types.ObjectId;
  fecha_emision: string;
  precio_total: number;
  detalle: string[];

}

const BillingSchema: Schema = new Schema({
  id_contrato: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrato', required: true },
  fecha_emision: { type: String, required: true },
  precio_total: { type: Number, required: true },
  detalle: { type: [String], required: true }
}, {
  timestamps: true,
  versionKey: false
});
export const BillingModel = mongoose.model<IBilling>('Billing', BillingSchema);
