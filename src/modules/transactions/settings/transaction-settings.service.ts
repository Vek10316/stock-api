import * as repo from './transaction-settings.repository';
import { TransactionSettings } from './transaction-settings.types';

export const readLatestTransactionID = async (data: string): Promise<string> => {
    data = data.toUpperCase();
    if (data !== "PURCHASES" && data !== "SALES") {
        throw new Error("Invalid transaction type. Must be 'PURCHASES' or 'SALES'.");
    }
    return await repo.readLatestTransactionID(data);
};

export const readTransactionSettings = async (filter: Partial<TransactionSettings>) => {
    return await repo.readTransactionSettings(filter);
};

export const createNewTransactionSetting = async (settings: Omit<TransactionSettings, "id">) => {
    return await repo.createNewTransactionSetting(settings);
};

export const updateTransactionSettings = async (id: number, settings: Partial<TransactionSettings>) => {
    return await repo.updateTransactionSettings(id, settings);
};

export const updateLatestTransactionID = async (transaction_type: "PURCHASES" | "SALES", latest_transaction_id: string) => {
    return await repo.updateLatestTransactionID(transaction_type, latest_transaction_id);
};

export const generateNextTransactionID = async (transaction_type: "PURCHASES" | "SALES"): Promise<string> => {
    const latestID = await repo.readLatestTransactionID(transaction_type);
    if (!latestID) {
        throw new Error(`No active transaction settings found for type ${transaction_type}`);
    }
    const date: string = new Date()
    .toISOString()
    .replace(/[^a-zA-Z0-9]/g, "");
    return `ERR-${new Date().toLocaleString(date)}`
};