import { IBilling } from '../../models/billing.model';

export const contieneVenta = (
  billing: IBilling,
  emit: (type: string, data: any) => void
): boolean => {
  if (billing.givePoints) {
    emit('factura-venta', billing);
    console.log('Emitido evento de venta con factura completa:', billing);
    return true;
  }
  return false;
};
