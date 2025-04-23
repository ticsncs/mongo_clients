import mongoose, { Schema, Document } from 'mongoose';

export interface IContrato extends Document {
  codigo: string;
  plan_internet: string;
  tipo_plan: string;
  fecha_inicio: string;
  forma_pago: string;
  fecha_activacion: string;
  fecha_corte: string;
  estado_ct: string;
  servicio_internet?: string;
  monto_deuda?: number;
  clienteId?: mongoose.Types.ObjectId; // Relación con Cliente
}

const ContratoSchema: Schema = new Schema({
  codigo: { type: String, required: true, unique: true },
  plan_internet: { type: String, required: true },
  estado_ct: { type: String, required: true },
  tipo_plan: {
    type: String,
    index: true,
    unique: true,
    sparse: true,
  },
  fecha_inicio: { type: String },
  forma_pago: { type: String },
  fecha_activacion: { type: String },
  fecha_corte: { type: String },
  servicio_internet: { type: String },
  monto_deuda: { type: Number },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente' }, // Relación con Cliente
}, {
  timestamps: true,
  versionKey: false,
});

ContratoSchema.statics.emitChange = (type: string, data: any) => {
  if ((ContratoModel as any).io) {
    (ContratoModel as any).io.emit('contrato-change', { type, data });
  }
};

export const ContratoModel = mongoose.model<IContrato>('Contrato', ContratoSchema) as any;
export default ContratoModel;
