import { IPuntosStrategy } from './IPointsStrategy';
import { IBilling } from '../../models/billing.model';
import { normalizar } from '../../utils/normalize';

export class ActivacionPuntosStrategy implements IPuntosStrategy {
  evaluar(billing: IBilling): boolean {
    const tieneActivacion = billing.detalle.some(descripcion => {
      const texto = normalizar(descripcion);
      return texto.includes('activacion');
    });
    return tieneActivacion;
  }

  calcularPuntos(billing: IBilling): number {
    // Ejemplo: 1 punto por cada dólar de precio total
    return Math.random();
  }
}
