import { IContrato } from '../../models/contract.model';
import { ContractRule } from '../../types/contract-rule';
import { contratosToCSV } from '../../utils/convert-csv';
import { appendCSVRow } from '../../utils/download-csv';



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
    
    const csv = contratosToCSV([updatedDoc], ['codigo']);
    console.log('🔍 CSV generado:', csv);

    const fileName = `contratos-${updatedDoc.codigo}.csv`;
    await appendCSVRow(fileName, csv);


    console.log(" *** Listo para enviar a la API de SOLNUS *****")
    // Emitir el evento de actualización
    emit('update', updatedDoc);
  } else {
    console.log('ℹ️ Ningún cambio relevante. No se emite');
  }


}
