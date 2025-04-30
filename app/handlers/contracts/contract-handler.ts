import { IContrato } from '../../models/contract.model';
import { ContractRule } from '../../types/contract-rule';

export async function handleContratoUpdate(
  prevDoc: IContrato | null,
  updatedDoc: IContrato,
  rules: ContractRule[],
  emit: (type: string, data: any) => void
) {
  if (!prevDoc) return;

  let huboCambio = false;

  for (const rule of rules) {
    const cambio = rule(prevDoc, updatedDoc);
    if (cambio) {
      huboCambio = true;
      // 👆 La lógica interna de cada regla ya guarda el código en su CSV
    }
  }

  if (huboCambio) {
    console.log('📣 Cambios relevantes detectados. Emitiendo...');
    emit('update', updatedDoc);
  } else {
    console.log('ℹ️ Ningún cambio relevante. No se emite');
  }
}
