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

export const generateNextTransactionID = async ( transaction_type: "PURCHASES" | "SALES" ): Promise<string> => {
    const latestID = await readLatestTransactionID(transaction_type);
    const prefix = (await readTransactionSettings({ transaction_type, is_active: true }))?.[0]?.transaction_prefix || "";

    // Always extract trailing digits
    const match = latestID.match(/(\d+)$/);

    const numericStr = match ? match[1] : "0";
    const numericPart = parseInt(numericStr, 10);

    const nextNumericPart = numericPart + 1;

    const paddedNext = nextNumericPart
        .toString()
        .padStart(numericStr.length, "0");

    return `${prefix}${paddedNext}`;
};