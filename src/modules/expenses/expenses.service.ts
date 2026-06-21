import * as repo from "./expenses.respository";
import type { ExpensesRecord } from "./expenses.type";

export const readAllExpenses = async () => {
    return await repo.readAllExpenses();
};

export const readExpenseRecordByID = async (id: string) => {
    return await repo.readExpenseRecordByID(Number.parseInt(id));
};

export const insertNewExpenseRecord = async (insertData: any) => {
    return await repo.insertNewExpenseRecord(insertData);
};

export const updateExpenseRecord = async (id: string, updateData: Partial<ExpensesRecord>): Promise<ExpensesRecord> => {
    await repo.updateExpenseRecord(Number.parseInt(id), updateData);
    return await repo.readExpenseRecordByID(Number.parseInt(id));
};