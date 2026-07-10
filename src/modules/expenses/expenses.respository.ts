import type { ExpensesRecord } from "./expenses.type";
import { getPool } from "../../config/db";
import * as gh from "../../utils/globalHelpers";
import * as sql from "mssql";
import { ApiPaginatedResponse } from "../../types/api-response.type";

export const readAllExpenses = async (filter?: Partial<ExpensesRecord>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<ApiPaginatedResponse<ExpensesRecord[]>> => {
    if (search !== undefined && search.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["expense_id", "expense_category", "expense_amount", "expense_description"],
                searchQuery: search
            }
        }
    }
    const pool = await getPool();
    let baseQuery = "SELECT * FROM expenses_record";
    baseQuery += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);
    const data = (await pool.query(baseQuery)).recordset;

    let totalCountQuery = "SELECT COUNT(expense_id) OVER() AS total_count FROM expenses_record";
    totalCountQuery += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);
    const totalCount = (await pool.query(totalCountQuery)).recordset[0].total_count;

    const metadata = {
        pageNo: sqlClauseOptions!.pagination!.pageNumber!,
        pageSize: sqlClauseOptions!.pagination!.pageSize!,
        totalCount,
        totalPages: Math.ceil(totalCount / sqlClauseOptions!.pagination!.pageSize),
    }

    const response = {
        data,
        metadata,
    }

    return response;
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