import { IContrato } from '../../models/contract.model';
import { ContractRule } from '../../types/contract-rule';

export async function handleContratoUpdate(
  prevDoc: IContrato | null,
  updatedDoc: IContrato,
  rules: ContractRule[],
  emit: (type: string, data: any) => void
): Promise<boolean> {
  if (!prevDoc) return false;

  let huboCambio = false;

  for (const rule of rules) {
    const cambio = rule(prevDoc, updatedDoc);
    if (cambio) {
      huboCambio = true;
    }
  }

  if (huboCambio) {
    emit('update', updatedDoc); // puede seguir siendo útil
  }

  return huboCambio;
}