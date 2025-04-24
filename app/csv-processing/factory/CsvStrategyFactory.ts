import { BillingCsvStrategy } from '../strategies/BillingCsvStrategy'; // Implementar BillingCsvStrategy
import { ICsvStrategy } from '../ICsvStrategy';

export class CsvStrategyFactory {
    static getStrategy(type: string): ICsvStrategy {
        switch (type) {
            case 'contract':
                return ;
            case 'billing':
                return new BillingCsvStrategy(); // Implementar BillingCsvStrategy

            // otros tipos en el futuro
            default:
                throw new Error(`Estrategia no implementada: ${type}`);
        }
    }
}
