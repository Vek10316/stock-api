import * as repo from './purchases.repository';
import { SqlSort } from '../../global/globalHelpers';

export const readPurchasesTransactions = async (data: any, showDetails: boolean, sort?: SqlSort) => {
    return await repo.readPurchasesTransactions(data, showDetails, sort);
};

export const insertPurchasesTranscation = async (data: any) => {
    const header = {
        transact_id: data.transact_id,
        supplier_id: data.supplier_id,
        transact_address: data.transact_address,
        transact_date: data.transact_date,
        transact_total_amount: data.transact_total_amount,
        transact_status: data.transact_status
    };
    const details = data.transact_details;

    return await repo.insertPurchasesTransaction(header, details);
};

export const updatePurchasesTransaction = async (id: string, data: any) => {
    const header = {
        transact_id: data.transact_id,
        supplier_id: data.supplier_id,
        transact_address: data.transact_address,
        transact_date: data.transact_date,
        transact_total_amount: data.transact_total_amount,
        transact_status: data.transact_status
    };
    const details = data.transact_details;
    return await repo.updatePurchasesTransaction(id, header, details);
};

export const deletePurchasesTransaction = async (id: string) => {
    return await repo.deletePurchasesTransaction(id);
}