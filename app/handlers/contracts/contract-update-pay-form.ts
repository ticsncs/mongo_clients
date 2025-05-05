import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';
import { csvByChangeType } from './change-csv-emitters';

const formasImportantes = ['Tarjeta de crédito', 'Debito bancario'];

export const isCambioFormaPagoRelevante: ContractRule = (prev, curr) => {
  const formaPrev = normalizar(prev.forma_pago);
  const formaNueva = normalizar(curr.forma_pago);

  const esCambio = formaPrev !== formaNueva;
  const contieneFormaImportante = formasImportantes.some(f => formaNueva.includes(f));
  const cambioValido = esCambio && formaPrev === 'efectivo' && contieneFormaImportante;

  console.log("➡️ Debug forma pago:");
  console.log("Anterior:", formaPrev, "| Nueva:", formaNueva);
  console.log("¿Es cambio?", esCambio);
  console.log("¿Contiene forma importante?", contieneFormaImportante);
  console.log("¿Cambio válido?", cambioValido);

  if (cambioValido) {
    console.log("🟢 Agregando por cambio de forma de pago:", curr.codigo);
    csvByChangeType.forma_pago.addRow(curr.codigo);
  }

  return cambioValido;
};

