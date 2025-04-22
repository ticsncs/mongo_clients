type ContratoPlano = {
  codigo: string;
  plan_internet: string;
  tipo_plan: string;
  fecha_inicio: string;
  forma_pago: string;
  fecha_activacion: string;
  fecha_corte: string;
  estado_ct: string;
  clienteId?: string; // Relación con Cliente
};

type ClientePlano = {
  nombre: string;
  cedula?: string;
  correo: string;
  telefono: string;


};

export function groupClientesYContratos(rows: any[]): ClientePlano[] {
  const clientesMap: Map<string, ClientePlano> = new Map();

  for (const row of rows) {
    const cedula = row['Cliente']?.replace(/"/g, '').trim().match(/\d+/)?.[0] || '';
    console.log('Cedula:', cedula);
    const nombre = row['Cliente']?.replace(/"/g, '').trim();
    const telefono = row['Teléfono']?.replace(/"/g, '').trim();
    const correo = row['Cliente/Correo electrónico']?.replace(/"/g, '').trim();
    const key = `${nombre}-${telefono}-${correo}`;

    const contrato: ContratoPlano = {
      codigo: row['Código']?.replace(/"/g, '').trim(),
      plan_internet: row['Plan Internet']?.replace(/"/g, '').trim(),
      estado_ct: row['Estado CT']?.replace(/"/g, '').trim(),
      tipo_plan: row['Tipo de Plan']?.replace(/"/g, '').trim(),
      fecha_inicio: row['Fecha Activacion']?.replace(/"/g, '').trim(),
      forma_pago: row['Forma de Pago']?.replace(/"/g, '').trim(),
      fecha_activacion: row['Fecha Activacion']?.replace(/"/g, '').trim(),
      fecha_corte: row['Fecha de Corte']?.replace(/"/g, '').trim(),
    };

    if (!clientesMap.has(key)) {
      clientesMap.set(key, {
        nombre,
        cedula,
        telefono,
        correo,
      });
    } 
  }

  return Array.from(clientesMap.values());
}
