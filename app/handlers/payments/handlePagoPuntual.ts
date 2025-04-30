import { IContrato } from '../../models/contract.model';



export function handlePagoPuntual(contrato: IContrato, fechaPago: Date, categoria: string): void {
  // Aquí colocas qué hacer si fue pago puntual
  console.log(`🎯 Se ha otorgado puntos para el contrato: ${contrato.codigo} por pago puntual, realizado por medio: ${categoria}, en fecha: ${fechaPago.toISOString()}`);
  
  // Puedes guardar en base de datos, emitir socket, dar puntos, etc.
}
