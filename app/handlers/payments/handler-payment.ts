import { IContrato } from '../../models/contract.model'; // Asegúrate de importar bien tu modelo
import { handlePagoPuntual } from './handlePagoPuntual';
import { handlePagoGracia } from './handlePagoGracia';

/**
 * Procesa un pago y ejecuta acciones si es puntual o en gracia.
 */
export async function procesarPago(contrato: IContrato, fechaPagoStr: string) {
  console.log("Contrato", contrato.codigo)
    if (!contrato || !contrato.fecha_corte) {
    console.warn('⚠️ Contrato inválido o sin fecha de corte');
    return;
  }

  try {
    const fechaCorte = new Date(contrato.fecha_corte);
    const fechaPago = new Date(fechaPagoStr);

    if (isNaN(fechaCorte.getTime()) || isNaN(fechaPago.getTime())) {
      console.warn('⚠️ Fecha de corte o fecha de pago inválida');
      return;
    }

    //Calculamos fecha de inicio del período de gracia
    const inicioGracia = new Date(fechaCorte);
    inicioGracia.setDate(inicioGracia.getDate() - 10);

    console.log(`📅 Fecha de pago: ${fechaPago.toISOString()}, Fecha de corte: ${fechaCorte.toISOString()}, Inicio de gracia: ${inicioGracia.toISOString()}`);

    if (fechaPago < inicioGracia) {
      console.log('💳 Pago Puntual detectado');
      handlePagoPuntual(contrato, fechaPago);
    } else if (fechaPago >= inicioGracia && fechaPago <= fechaCorte) {
      console.log('⏳ Pago en Gracia detectado');
      handlePagoGracia(contrato, fechaPago);
    } else {
      console.log('🚫 Pago fuera de plazo. No se ejecutan beneficios.');
    }

  } catch (error) {
    console.error('❌ Error procesando pago:', error);
  }
}
