import { normalizar } from "../../utils/normalize";

const pagosEfectivo = ['efectivo', 'tarjeta', 'efectivo dt 001-010', 'efectivo jel 002-002', 'efectivo jcr 001-220'].map(normalizar);
const pagosMediosDigitales = ['cobro western union', 'pagos de ahorita', 'payphone', 'recaudacion facilito', 'recaudaciones coopmego', 'cuenta transitoria banco pichincha'];
const pagosTransferencia = ['banco pichincha', 'banco bolivariano', 'banco guayaquil', 'banco machala', 'banco produbanco', 'banco loja', 'banco solidario', 'cooperativa padre julian lorente'];
const pagosDebitoBancario = ['cta transitorio debitos general bco loja', 'cta transitoria bco diners', 'cta transitorio banco machala', 'cta transitoria bco pichincha'];


const categoriasPago: Record<string, string> = {
    efectivo: 'CLIENTES PAGO EFECTIVO',
    mediosDigitales: 'CLIENTES PAGO MEDIOS DIGITALES',
    transferencia: 'CLIENTES PAGO TRANSFERENCIAS',
    debitoBancario: 'CLIENTES PAGO DEBITO BANCARIO',
  };


  export function obtenerCategoria(tipoPago: string): string | null {
  if (pagosEfectivo.includes(tipoPago)) return categoriasPago.efectivo;
  if (pagosMediosDigitales.includes(tipoPago)) return categoriasPago.mediosDigitales;
  if (pagosTransferencia.includes(tipoPago)) return categoriasPago.transferencia;
  if (pagosDebitoBancario.includes(tipoPago)) return categoriasPago.debitoBancario;
  return null;
}

