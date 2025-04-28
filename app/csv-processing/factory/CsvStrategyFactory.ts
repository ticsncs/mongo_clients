import { BillingCsvStrategy } from '../strategies/BillingCsvStrategy'; // Implementar BillingCsvStrategy
import { PaymentCsvStrategy } from '../strategies/PaymentCsvStrategy';
import { ICsvStrategy } from '../ICsvStrategy';

export class CsvStrategyFactory {
    static getStrategy(type: string): ICsvStrategy {
        switch (type) {
            case 'contract':
                return ;
            case 'billing':
                return new BillingCsvStrategy(); // Implementar BillingCsvStrategy
            case 'payment':
                return new PaymentCsvStrategy(); // Implementar PaymentCsvStrategy
            default:
                throw new Error(`Estrategia no implementada: ${type}`);
        }
    }
}
