import { IBilling } from '../../models/billing.model';

export const contieneVenta = (
  billing: IBilling,
  emit: (type: string, data: any) => void
): boolean => {
  const palabrasClaveVenta = ['ROUTER', 'TV', 'VENTA', 'EQUIPO'];

  const tieneVenta = billing.detalle.some((desc: string) =>
    palabrasClaveVenta.some(palabra => desc.toUpperCase().includes(palabra))
  );

  if (tieneVenta) {
    emit('factura-venta', billing);
    console.log('Emitido evento de venta:', billing);
    return true;
  }

  return false;
};
