import { IContrato } from '../../models/contract.model';

export function handlePagoGracia(contrato: IContrato, fechaPago: Date): void {
  // Aquí colocas qué hacer si fue pago en gracia
  console.log(`🎯 Pago en gracia para contrato ${contrato.codigo} en fecha ${fechaPago.toISOString()}`);
  
  // Puedes guardar en base de datos, emitir socket, etc.
}
