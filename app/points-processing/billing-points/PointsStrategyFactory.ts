import { ActivacionPuntosStrategy } from './activation-points-strategy';
import { VentaPuntosStrategy } from './sale-points-strategy';
import { IPuntosStrategy } from './IPointsStrategy';

export class PuntosStrategyFactory {
  static getStrategy(tipo: 'activacion' | 'venta'): IPuntosStrategy {
    switch (tipo) {
      case 'activacion':
        return new ActivacionPuntosStrategy();
      case 'venta':
        return new VentaPuntosStrategy();
      default:
        throw new Error(`No existe estrategia de puntos para tipo: ${tipo}`);
    }
  }
}
