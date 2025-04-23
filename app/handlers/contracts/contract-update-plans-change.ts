import { ContractRule } from '../../types/contract-rule';
import { normalizar } from '../../utils/normalize';

// Mapa normalizado en minúsculas
const PrioridadPlanes: Record<string, number> = {
  'plan básico': 0,
  'plan ideal': 1,
  'plan premier': 2,
  'plan nitro': 3,
};

// Función auxiliar para obtener la prioridad
function getPrioridad(plan: string | undefined): number {
    const key = normalizar(plan);
    const prioridad = PrioridadPlanes[key];
    console.log('🔍 Plan:', plan, 'Prioridad:', prioridad, 'Key:', key);
    return prioridad ?? -1;
  }

// Regla de cambio relevante
export const isCambioPlanRelevante: ContractRule = (prev, curr) => {
    const anterior = getPrioridad(prev.plan_internet);
    const nuevo = getPrioridad(curr.plan_internet);
  
    return nuevo > anterior;
  };