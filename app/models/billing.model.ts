import mongoose, { Schema, Document } from 'mongoose';

export interface IBilling extends Document {
  id_factura: string; // 🚀 Nuevo campo
  id_contrato: mongoose.Types.ObjectId;
  fecha_emision: string;
  precio_total: number;
  detalle: string[];
  givePoints: boolean;
}

const BillingSchema: Schema = new Schema({
  id_factura: { type: String, required: true, unique: true }, // 🚀 nuevo campo obligatorio
  id_contrato: { type: mongoose.Schema.Types.ObjectId, ref: 'Contrato', required: true },
  fecha_emision: { type: String, required: true },
  precio_total: { type: Number, required: true },
  detalle: { type: [String], required: true },
  givePoints: { type: Boolean, default: false },
}, {
  timestamps: true,
  versionKey: false,
});

BillingSchema.statics.emitChange = (type: string, data: any) => {
  if ((BillingModel as any).io) {
    (BillingModel as any).io.emit('billing-change', { type, data });
  }
};

export const BillingModel = mongoose.model<IBilling>('Billing', BillingSchema) as any;
export default BillingModel;
