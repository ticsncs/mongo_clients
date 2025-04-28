import { IContrato } from '../../models/contract.model';

export function handlePagoPuntual(contrato: IContrato, fechaPago: Date): void {
  // Aquí colocas qué hacer si fue pago puntual
  console.log(`🎯 Pago puntual para contrato ${contrato.codigo} en fecha ${fechaPago.toISOString()}`);
  
  // Puedes guardar en base de datos, emitir socket, dar puntos, etc.
}
