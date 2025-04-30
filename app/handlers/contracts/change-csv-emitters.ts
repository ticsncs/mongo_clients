// utils/change-csv-emitters.ts

import { CSVDownloader } from '../../utils/dowload-csv';

let formaPagoCsv: CSVDownloader | null = null;
let planCsv: CSVDownloader | null = null;

export const csvByChangeType = {
  get forma_pago(): CSVDownloader {
    if (!formaPagoCsv) {
      formaPagoCsv = new CSVDownloader('cambio-forma-pago.csv');
    }
    return formaPagoCsv;
  },
  get plan_internet(): CSVDownloader {
    if (!planCsv) {
      planCsv = new CSVDownloader('cambio-plan.csv');
    }
    return planCsv;
  },
};
