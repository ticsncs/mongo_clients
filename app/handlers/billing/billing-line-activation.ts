import { IBilling } from '../../models/billing.model';

export const contieneActivacion = (
  billing: IBilling,
  emit: (type: string, data: any) => void
): boolean => {
  const tieneActivacion = billing.detalle.some((desc: string) =>
    desc.toUpperCase().includes('ACTIVACION')
  );

  if (tieneActivacion) {
    emit('factura-activacion', billing);
    console.log('Emitido evento de activación:', billing);
    return true;
  }
  return false;
};
