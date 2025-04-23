import { IContrato } from '../models/contract.model';

export function contratosToCSV(
    // Convierte un array de contratos a formato CSV
    contratos: IContrato[],
    campos: (keyof IContrato)[]
  ): string {   
    // Genera un CSV a partir de un array de contratos y los campos especificados
    const header = campos.join(',');
    // Crea la cabecera del CSV a partir de los campos
    const rows = contratos.map(contrato =>
      campos
        .map(campo => {
          const valor = contrato[campo];
          const safe =
            typeof valor === 'string'
              ? `"${valor.replace(/"/g, '""')}"`
              : valor ?? '';
          return safe;
        })
        .join(',')
    );
  
    return [header, ...rows].join('\n');
  }