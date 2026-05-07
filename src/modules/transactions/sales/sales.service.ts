import * as repo from './sales.repository';
import { SqlSort } from '../../global/globalHelpers';

export const readSalesTransactions = async (data: any, showDetails: boolean, sort?: SqlSort) => {
    return await repo.readSalesTransactions(data, showDetails, sort);
};

export const insertSalesTranscation = async (data: any) => {
    const header = {
        transact_id: data.transact_id,
        buyer_id: data.supplier_id,
        transact_address: data.transact_address,
        transact_date: data.transact_date,
        transact_total_amount: data.transact_total_amount,
        transact_status: data.transact_status
    };
    const details = data.transact_details;

    return await repo.insertSalesTransaction(header, details);
};

export const updateSalesTransaction = async (id: string, data: any) => {
    const header = {
        transact_id: data.transact_id,
        buyer_id: data.supplier_id,
        transact_address: data.transact_address,
        transact_date: data.transact_date,
        transact_total_amount: data.transact_total_amount,
        transact_status: data.transact_status
    };
    const details = data.transact_details;
    return await repo.updateSalesTransaction(id, header, details);
};

export const deleteSalesTransaction = async (id: string) => {
    return await repo.deleteSalesTransaction(id);
}