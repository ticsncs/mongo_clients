import { IBilling } from '../../models/billing.model';

export const contieneActivacion = (
  billing: IBilling,
  emit: (type: string, data: any) => void
): boolean => {
  if (billing.givePoints) {
    emit('factura-activacion', billing);
    console.log('Emitido evento de activación con factura completa:', billing);
    return true;
  }
  return false;
};
