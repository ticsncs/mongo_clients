import { IContrato } from '../models/contract.model';

export type ContractRule = (
    prev: IContrato, 
    curr: IContrato
) => boolean;
