import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';
import { csvByChangeType } from './change-csv-emitters';

const PrioridadPlanes: Record<string, number> = {
  'plan básico': 0,
  'plan ideal': 1,
  'plan premier': 2,
  'plan nitro': 3,
};

function getPrioridad(plan: string | undefined): number {
  const key = normalizar(plan);
  return PrioridadPlanes[key] ?? -1;
}

export const isCambioPlanRelevante: ContractRule = (prev, curr) => {
  const anterior = getPrioridad(prev.plan_internet);
  const nuevo = getPrioridad(curr.plan_internet);

  const cambio = nuevo > anterior;

  if (cambio) {
    csvByChangeType.plan_internet.addRow(curr.codigo);
  }

  return cambio;
};
