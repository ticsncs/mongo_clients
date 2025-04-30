import { IContrato } from '../../models/contract.model';

export function handlePagoGracia(contrato: IContrato, fechaPago: Date, categoria: string): void {
  // Aquí colocas qué hacer si fue pago en gracia
  console.log(`🎯 Se ha otorgado puntos para el contrato: ${contrato.codigo} por pago durante el periodo de gracia, realizado por medio: ${categoria}, en fecha: ${fechaPago.toISOString()}`);
  
  // Puedes guardar en base de datos, emitir socket, etc.
}
