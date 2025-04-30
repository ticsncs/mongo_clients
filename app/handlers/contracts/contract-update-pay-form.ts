import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';
import { csvByChangeType } from './change-csv-emitters';

const formasImportantes = ['tarjeta', 'debito'];

export const isCambioFormaPagoRelevante: ContractRule = (prev, curr) => {
  const formaPrev = normalizar(prev.forma_pago);
  const formaNueva = normalizar(curr.forma_pago);

  const esCambio = formaPrev !== formaNueva;
  const contieneFormaImportante = formasImportantes.some(f => formaNueva.includes(f));

  const cambioValido = esCambio && formaPrev === 'efectivo' && contieneFormaImportante;

  if (cambioValido) {
    csvByChangeType.forma_pago.addRow(curr.codigo);
  }

  return cambioValido;
};
