import type { ExpensesRecord } from "./expenses.type";
import { getPool } from "../../config/db";
import * as gh from "../global/globalHelpers";
import * as sql from "mssql";

export const readAllExpenses = async () => {
    const pool = await getPool();
    const query = "SELECT * FROM expenses_record";
    return (await pool.query(query)).recordset;
};

export const readExpenseRecordByID = async (expense_id: number): Promise<ExpensesRecord> => {
    const pool = await getPool();
    const query = `SELECT * FROM expenses_record WHERE expense_id = '${expense_id}'`;
    return (await pool.query(query)).recordset[0];
};

export const insertNewExpenseRecord = async (expense: Omit<ExpensesRecord, "expense_id">) => {
    const pool = await getPool();
    try {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("expenses_record", expense, transaction, request);
        console.log(query);
        const res = await request.query(query);
        await transaction.commit();
        return res.rowsAffected[0] > 0;
    } catch (error) {
        return error;
    }
};

export const updateExpenseRecord = async (expense_id: number, expense: Partial<ExpensesRecord>) => {
    const pool = await getPool();
    try {
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("expenses_record", expense, { expense_id }, transaction, request);
        const res = await request.query(query);
        await transaction.commit();
        return res.rowsAffected[0] > 0;
    } catch (error) {
        return error;
    }
};

export const readMonthlyExpensesTotal = async (startDate: Date, endDate: Date) => {
    const pool = await getPool();
    const start = startDate.toLocaleDateString("en-CA");
    const end = endDate.toLocaleDateString("en-CA");
    const query = `SELECT SUM(expense_amount) as expense_amount FROM expenses_record WHERE expense_date BETWEEN '${start}' AND '${end}'`;
    const res = (await pool.query(query)).recordset[0].expense_amount;
    return res;
}