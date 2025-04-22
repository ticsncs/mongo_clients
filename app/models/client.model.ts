import mongoose, { Schema, Document } from 'mongoose';

export interface ICliente extends Document {
  nombre: string;
  cedula?: string;
  correo: string;
  telefono: string;
}

const ClienteSchema: Schema = new Schema({
  nombre: { type: String, required: true },
  cedula: {
    type: String,
    required: false,
    index: true,
    unique: true,
    sparse: true, // Solo aplica unique si el campo existe
  },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
}, {
  timestamps: true,
  versionKey: false
});




// 🟢 Insert
ClienteSchema.post('save', function (doc) {
  console.log('🟢 Cliente insertado:', doc);
  ClienteModel.emitChange('insert', doc);
});

// 🔵 Update
ClienteSchema.post('findOneAndUpdate', async function () {
  const doc = await this.model.findOne(this.getQuery());
  console.log('🔵 Cliente actualizado:', doc);
  ClienteModel.emitChange('update', doc);
});

// 🔴 Delete
ClienteSchema.post('findOneAndDelete', function (doc) {
  console.log('🔴 Cliente eliminado:', doc);
  ClienteModel.emitChange('delete', doc);
});

// Función para activar desde app.ts
ClienteSchema.statics.watchInsertUpdateDelete = (io) => {
  ClienteModel.io = io;
  console.log('👁️ Middleware Cliente activado con Socket.IO.');
};

// Emitir evento a sockets
ClienteSchema.statics.emitChange = (type: string, data: any) => {
  if (ClienteModel.io) {
    ClienteModel.io.emit('cliente-change', { type, data });
  }
};


export const ClienteModel = mongoose.model<ICliente>('Cliente', ClienteSchema) as any;
// export default mongoose.model<ICliente>('Cliente', ClienteSchema);
export default ClienteModel;
