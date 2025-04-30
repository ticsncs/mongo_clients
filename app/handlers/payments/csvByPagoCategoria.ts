// utils/csvByPagoCategoria.ts
import { CSVDownloader } from '../../utils/dowload-csv';

const fecha = new Date().toISOString().split('T')[0]; // "2025-04-29"

let efectivoPuntual: CSVDownloader | null = null;
let efectivoGracia: CSVDownloader | null = null;
let digitalesPuntual: CSVDownloader | null = null;
let digitalesGracia: CSVDownloader | null = null;
let transferencia: CSVDownloader | null = null;
let debito: CSVDownloader | null = null;

export const csvByPagoCategoria = {
  get efectivo_puntual() {
    if (!efectivoPuntual) {
      efectivoPuntual = new CSVDownloader(`efectivo-puntual-${fecha}.csv`);
    }
    return efectivoPuntual;
  },
  get efectivo_gracia() {
    if (!efectivoGracia) {
      efectivoGracia = new CSVDownloader(`efectivo-gracia-${fecha}.csv`);
    }
    return efectivoGracia;
  },
  get digitales_puntual() {
    if (!digitalesPuntual) {
      digitalesPuntual = new CSVDownloader(`digitales-puntual-${fecha}.csv`);
    }
    return digitalesPuntual;
  },
  get digitales_gracia() {
    if (!digitalesGracia) {
      digitalesGracia = new CSVDownloader(`digitales-gracia-${fecha}.csv`);
    }
    return digitalesGracia;
  },
  get transferencia() {
    if (!transferencia) {
      transferencia = new CSVDownloader(`transferencia-${fecha}.csv`);
    }
    return transferencia;
  },
  get debito() {
    if (!debito) {
      debito = new CSVDownloader(`debito-bancario-${fecha}.csv`);
    }
    return debito;
  },
};
