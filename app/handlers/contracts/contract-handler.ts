import { IContrato } from '../../models/contract.model';
import { ContractRule } from '../../types/contract-rule';

export async function handleContratoUpdate(
  prevDoc: IContrato | null,
  updatedDoc: IContrato,
  rules: ContractRule[],
  emit: (type: string, data: any) => void
) {

  if (!prevDoc) return;

  const existeActualizacionesRelevantes = rules.some(rule => rule(prevDoc, updatedDoc));

  if (existeActualizacionesRelevantes) {
    console.log('📣 Cambio relevante detectado. Emitiendo...');
    console.log('📄 Antes:', {
      forma_pago: prevDoc.forma_pago,
      plan_internet: prevDoc.plan_internet,
    });
    console.log('📄 Después:', {
      forma_pago: updatedDoc.forma_pago,
      plan_internet: updatedDoc.plan_internet,
    });

    emit('update', updatedDoc);
  } else {
    console.log('ℹ️ Ningún cambio relevante. No se emite');
  }


}
