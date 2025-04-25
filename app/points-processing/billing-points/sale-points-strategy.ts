import { IPuntosStrategy } from './IPointsStrategy';
import { IBilling } from '../../models/billing.model';
import { normalizar } from '../../utils/normalize';
import dotenv from 'dotenv';

dotenv.config();
export class VentaPuntosStrategy implements IPuntosStrategy {
  evaluar(billing: IBilling): boolean {
    const tieneVenta = billing.detalle.some(descripcion => {
      const texto = normalizar(descripcion);
      return texto.includes('venta');
    });
    return tieneVenta;
  }

  calcularPuntos(billing: IBilling): number {
    // 1 dólar equivale a 500 puntos, se otorga el 1% de puntos en dólares
    const puntosPorDolar = Number(process.env.PUNTOS_POR_DOLAR)  as any; // Valor por defecto si no está definido en .env
    const porcentajePuntos = Number(process.env.PORCENTAJE) as any  // Valor por defecto si no está definido en .env
    //Editar los valores en el archivo .env
    return Math.floor((billing.precio_total * puntosPorDolar) * porcentajePuntos);
  }
}
