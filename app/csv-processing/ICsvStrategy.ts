//Strategy para procesar CSVs

//Parametros de entrada
// filePath: string - Ruta del archivo CSV a procesar
// context: Map<string, any> - Contexto para almacenar datos temporales o resultados intermedios
export interface ICsvStrategy {
  preload?(filePath: string, objectContext: Map<string, any>): Promise<void>;
  processRow(row: any, objectContext: Map<string, any>): Promise<void>;
  flush?(objectContext: Map<string, any>): Promise<void>; // ✅ Corregido
}
