import sql from 'mssql';
import { getPool } from '../../../config/db';
import * as gh from '../../../utils/globalHelpers';
import type { SalesTransactions } from './sales.types';
import type { TransactionDetails } from '../shared.transactions.types';
import type { Buyer, BuyerVehicles } from '../../clients/buyer/buyer.types';
import type { ApiPaginatedResponse } from '../../../types/api-response.type';

export const readSalesTransactions = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<SalesTransactions[]> => {
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["buyer_id", "transact_id"],
                searchQuery: search
            },
        };
    };
    const pool = await getPool();
    try {
        let query = "SELECT * FROM sales_transactions";
        query += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export type SalesTransactionListResult = SalesTransactions & { buyer_name: string, total_quantity: number, plate_no: string[] };

export const listSaleTransactions = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string):
    Promise<ApiPaginatedResponse<SalesTransactionListResult[]>> => {

    if (search !== undefined && search.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["P.buyer_id", "P.transact_id", "S.buyer_name", "V.plate_no"],
                searchQuery: search
            },
        };
    };

    const pool = await getPool();
    try {
        let baseQuery = "SELECT P.*, S.buyer_name, D.total_quantity, V.plate_no FROM sales_transactions AS P" +
            " LEFT JOIN (" +
            " SELECT transact_id, SUM(item_quantity) AS total_quantity FROM sales_transactions_details GROUP BY transact_id" +
            " ) AS D ON P.transact_id = D.transact_id" +
            " LEFT JOIN master_buyer AS S ON P.buyer_id = S.buyer_id" +
            " LEFT JOIN (" +
            " SELECT buyer_id, STRING_AGG(plate_no, ', ') AS plate_no FROM buyer_vehicles GROUP BY buyer_id" +
            " ) AS V ON P.buyer_id = V.buyer_id";

        sqlClauseOptions = {
            ...sqlClauseOptions,
            alias: "P"
        };
        baseQuery += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);

        const data = (await pool.query(baseQuery)).recordset as SalesTransactionListResult[];

        let totalCountQuery = "SELECT COUNT(DISTINCT(P.transact_id)) AS total_count FROM sales_transactions AS P" +
            " LEFT JOIN master_buyer AS S ON P.buyer_id = S.buyer_id" +
            " LEFT JOIN buyer_vehicles AS V ON P.buyer_id = V.buyer_id";
        totalCountQuery += await gh.buildSqlConditions({}, {
            ...sqlClauseOptions,
            sort: undefined,
            pagination: undefined,
        });

        const totalCount = (await pool.query(totalCountQuery)).recordset[0].total_count;
        const metadata = {
            pageNo: sqlClauseOptions?.pagination?.pageNumber ?? 1,
            pageSize: sqlClauseOptions?.pagination?.pageSize ?? 100,
            totalCount,
            totalPages: Math.ceil(totalCount / (sqlClauseOptions?.pagination?.pageSize ?? 100))
        }

        const response = {
            data,
            metadata
        };

        return response;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const insertSalesTransaction = async (data: SalesTransactions, details: Omit<TransactionDetails, "detail_id">[]): Promise<SalesTransactions> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("sales_transactions", data, transaction, request);

        await request.query(query);

        for (const d of details) {
            await insertSalesDetails(d, transaction);
        }

        await transaction.commit();
        return data;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    }
};

export const updateSalesTransaction = async (transact_id: string, data: Partial<Omit<SalesTransactions, "transact_id">>, details: Omit<TransactionDetails, "detail_id">[]): Promise<SalesTransactions> => {
    const pool = await getPool()
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("sales_transactions", data, { transact_id }, transaction, request);
        await request.query(query);

        // Delete then re-insert details. Update does not delete removed details. + Simplicity
        await deleteSalesDetails(transact_id, transaction, request);

        for (const d of details) {
            await insertSalesDetails(d, transaction, request);
        }

        await transaction.commit();
        return (await readSalesTransactions({ transact_id }))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    }
};

export const deleteSalesTransaction = async (id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    const request = new sql.Request(transaction);
    try {
        await transaction.begin();
        const query = `DELETE FROM sales_transactions WHERE transact_id = '${id}'`;
        const result = await request.query(query);
        await deleteSalesDetails(id, transaction, request);

        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    }
};

export const readSalesDetails = async (transact_id: string): Promise<TransactionDetails[]> => {
    const pool = await getPool();
    let query = `SELECT * FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await pool.query(query);
    return result.recordset;
};

export const insertSalesDetails = async (data: Omit<TransactionDetails, "detail_id">, transaction: sql.Transaction, request?: sql.Request): Promise<boolean> => {
    request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("sales_transactions_details", data, transaction, request);
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
};

export const updateSaleDetails = async (detail_id: number, updateData: Partial<TransactionDetails>, transaction: sql.Transaction): Promise<boolean> => {
    const query = await gh.buildSqlUpdateQuery("sales_transactions_details", updateData, { detail_id }, transaction);
    const request = new sql.Request(transaction);
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
}

export const deleteSalesDetails = async (transact_id: string, transaction: sql.Transaction, request?: sql.Request): Promise<boolean> => {
    if (!request) {
        request = new sql.Request(transaction);
    }
    const query = `DELETE FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
};

export const getSalesDetailIDs = async (transact_id: string): Promise<string[]> => {
    const pool = await getPool();
    try {
        const query = `SELECT detail_id FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const readFullSaleDetails = async (filter?: Partial<SalesTransactions>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string):
    Promise<{
        header: SalesTransactions,
        details: TransactionDetails[],
        buyer: Buyer,
        vehicles: BuyerVehicles[],
    }[]> => {
    const pool = await getPool();
    let query = await `SELECT P.*, ` +
        `D.detail_id, D.stock_id, D.item_price, ` +
        `D.item_quantity, D.transact_subtotal, ` +

        `S.buyer_id_type, S.buyer_name, S.buyer_address, ` +
        `S.buyer_phone, S.buyer_email, S.buyer_tin, ` +

        `V.vehicle_id, V.plate_no ` +

        `FROM sales_transactions AS P ` +
        `LEFT JOIN sales_transactions_details AS D ` +
        `ON P.transact_id = D.transact_id ` +
        `LEFT JOIN master_buyer AS S ` +
        `ON P.buyer_id = P.buyer_id ` +
        `LEFT JOIN buyer_vehicles AS V ` +
        `ON P.buyer_id = V.buyer_id`;
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            sort: {
                column: "D.detail_id",
                order: "DESC",
            },
            search: {
                columns: ["P.buyer_id", "P.transact_id", "S.buyer_name", "V.plate_no"],
                searchQuery: search
            }
        };
    }
    query += await gh.buildSqlConditions(filter ?? {}, {
        ...sqlClauseOptions,
        alias: "P",
    });
    const result = (await pool.query(query)).recordset;
    let response = new Map<string, {
        header: SalesTransactions;
        details: TransactionDetails[];
        buyer: Buyer;
        vehicles: BuyerVehicles[];
    }>();

    for (const row of result) {
        if (!response.has(row.transact_id)) {
            response.set(row.transact_id, {
                header: {
                    transact_id: row.transact_id,
                    buyer_id: row.buyer_id,
                    transact_address: row.transact_address,
                    transact_date: row.transact_date,
                    transact_total_amount: row.transact_total_amount,
                    transact_status: row.transact_status,
                },
                details: [],
                buyer: {
                    buyer_id: row.buyer_id,
                    buyer_id_type: row.buyer_id_type,
                    buyer_name: row.buyer_name,
                    buyer_address: row.buyer_address,
                    buyer_phone: row.buyer_phone,
                    buyer_email: row.buyer_email,
                    buyer_tin: row.buyer_tin,
                },
                vehicles: [],
            });
        }
        if (row.detail_id) {
            response.get(row.transact_id)!.details.push({
                detail_id: row.detail_id,
                transact_id: row.transact_id,
                stock_id: row.stock_id,
                item_price: row.item_price,
                item_quantity: row.item_quantity,
                transact_subtotal: row.transact_subtotal,
            })
        }
        if (row.vehicle_id !== undefined) {
            response.get(row.buyer_id)!.vehicles.push({
                vehicle_id: row.vehicle_id,
                buyer_id: row.buyer_id,
                plate_no: row.plate_no,
            })
        }
    }
    return Array.from(response.values());
}

export const getSoldTotalQuantity = async (transact_id: string): Promise<number> => {
    const pool = await getPool();
    const query = `SELECT SUM(item_quantity) as total_quantity FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
    const result: { total_quantity: number } = (await pool.query(query)).recordset[0];
    return result.total_quantity;
};

export const readSalesByDateRange = async (startDate: Date, endDate: Date): Promise<SalesTransactions[]> => {
    const pool = await getPool();
    const query = `SELECT * FROM sales_transactions WHERE transact_date BETWEEN ${startDate.toLocaleDateString("en-CA")} AND ${endDate.toLocaleDateString("en-CA")}`;
    const result = (await pool.query(query)).recordset;
    return result;
};

export const readSalesTotalByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<SalesTransactions, "transact_total_amount">> => {
    const pool = await getPool();
    const start = startDate.toLocaleDateString('en-CA');
    const end = endDate.toLocaleDateString('en-CA');
    const query = `SELECT SUM(transact_total_amount) as transact_total_amount FROM sales_transactions WHERE transact_date BETWEEN '${start}' AND '${end}'`
    const result = (await pool.query(query)).recordset[0].transact_total_amount as Pick<SalesTransactions, "transact_total_amount">;
    return result;
}

export const readSoldItemsByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<TransactionDetails, "stock_id" | "item_quantity">[]> => {
    const pool = await getPool();
    const start = startDate.toLocaleDateString('en-CA');
    const end = endDate.toLocaleDateString('en-CA');
    const query = `SELECT stock_id, SUM(item_quantity) AS item_quantity FROM sales_transactions_details WHERE transact_id IN (` +
        `SELECT transact_id FROM sales_transactions WHERE transact_date BETWEEN '${start}' AND '${end}'` +
        `) GROUP BY stock_id;`;
    const result = (await pool.query(query)).recordset as TransactionDetails[];
    return result.map(res => ({
        stock_id: res.stock_id,
        item_quantity: res.item_quantity
    }));
}