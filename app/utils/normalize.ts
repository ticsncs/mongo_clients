
export function normalizar(valor: string | undefined): string {
    return valor
      ?.toLowerCase()
      .normalize("NFD")                   // separa tildes
      .replace(/[\u0300-\u036f]/g, '')   // elimina tildes
      .trim() || '';
  }
  