import { IBilling } from "../../models/billing.model";

export interface IPuntosStrategy {
    evaluar(billing: IBilling): boolean;
    calcularPuntos(billing: IBilling): number;
  }
  