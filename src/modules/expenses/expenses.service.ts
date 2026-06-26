import * as repo from "./expenses.respository";
import type { ExpensesRecord } from "./expenses.type";

export const readAllExpenses = async () => {
    return await repo.readAllExpenses();
};

export const readExpenseRecordByID = async (id: string) => {
    return await repo.readExpenseRecordByID(Number.parseInt(id));
};

export const insertNewExpenseRecord = async (insertData: Omit<ExpensesRecord, "expense_id">) => {
    insertData = {
        ...insertData,
        expense_category: insertData.expense_category.trim().toUpperCase(),
    }
    return await repo.insertNewExpenseRecord(insertData);
};

export const updateExpenseRecord = async (id: string, updateData: Partial<ExpensesRecord>): Promise<ExpensesRecord> => {
    await repo.updateExpenseRecord(Number.parseInt(id), updateData);
    return await repo.readExpenseRecordByID(Number.parseInt(id));
};

export  const readMonthlyExpensesTotal = async (startDate: Date, endDate: Date) => {
    return await repo.readMonthlyExpensesTotal(startDate, endDate);
};