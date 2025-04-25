import { IBilling } from '../../models/billing.model';
import { contieneActivacion } from './billing-line-activation';
import { contieneVenta } from './billing-line-sales';

// Tipo para el callback de emisión
type BillingEmit = (type: string, data: any) => void;

// Tipo para una regla de facturación
type BillingRule = (billing: IBilling, emit: BillingEmit) => boolean;

const billingRules: { rule: BillingRule; code: number }[] = [
    { rule: contieneActivacion, code: 1,  },
    { rule: contieneVenta, code: 2 },
];

/**
 * Evalúa el tipo de factura aplicando reglas y permitiendo emitir eventos.
 */
export function obtenerTipoFactura(
    billing: IBilling,
    emit: BillingEmit
  ): number[] {
    const codes: number[] = [];
  
    for (const { rule, code } of billingRules) {
      if (rule(billing, emit)) {
        codes.push(code);
      }
    }
  
    if (codes.length === 0) {
      console.log(`ℹ️ No se encontró tipo de factura para billing ${billing._id}`);
    }
  
    return codes;
  }
  