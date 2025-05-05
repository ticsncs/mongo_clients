import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';
import { csvByChangeType } from './change-csv-emitters';

const PrioridadPlanes: Record<string, number> = {
  'plan básico gpon': 0,
  'plan básico': 1,
  'plan ideal': 2,
  'plan ideal+': 3,
  'plan premier': 4,
  'plan premier+': 5,
  'plan nitro': 6,
};

function getPrioridad(plan: string | undefined): number {
  const key = normalizar(plan);
  const prioridad = PrioridadPlanes[key];
  console.log('🔍 Plan:', plan, '| Key:', key, '| Prioridad:', prioridad);
  return prioridad ?? -1;
}

export const isCambioPlanRelevante: ContractRule = (prev, curr) => {
  const anterior = getPrioridad(prev.plan_internet);
  const nuevo = getPrioridad(curr.plan_internet);

  const cambio = nuevo > anterior;

  console.log("➡️ Comparando plan anterior vs nuevo:", anterior, "→", nuevo);
  console.log("¿Cambio válido?", cambio);

  if (cambio) {
    console.log("🟢 Agregando por actualizacion de plan:", curr.codigo);
    csvByChangeType.plan_internet.addRow(curr.codigo);
  }

  return cambio;
};
