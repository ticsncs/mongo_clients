import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';

const formasImportantes = ['tarjeta', 'debito'];

export const isCambioFormaPagoRelevante: ContractRule = (prev, curr) => {
  const formaPrev = normalizar(prev.forma_pago);
  const formaNueva = normalizar(curr.forma_pago);

  const esCambio = formaPrev !== formaNueva;

  const contieneFormaImportante = formasImportantes.some(f => formaNueva.includes(f));

  const cambioValido = esCambio && formaPrev === 'efectivo' && contieneFormaImportante;

  console.log('🔍 Forma de pago anterior:', formaPrev, 'Forma de pago nueva:', formaNueva);
  console.log('🔍 ¿Contiene forma importante?', contieneFormaImportante);

  return cambioValido;
};
