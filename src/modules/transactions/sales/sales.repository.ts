import sql from 'mssql';
import { sqlConfig } from '../../../config/db';
import * as gh from '../../global/globalHelpers';
import type { SqlSort } from '../../global/globalHelpers';
import type { SalesTransactions } from './sales.types';
import type { TransactionDetails, PurchasesTransactionOutput } from '../shared.transactions.types';
import type * as StockTypes from '../../stock/stock.types';
import { insertStockMovement, deleteStockMovement, readStockMovement } from '../../stock/stock.repository';

export const readSalesTransactions = async (data: Partial<SalesTransactions>, showDetails: boolean, sort?: SqlSort): Promise<PurchasesTransactionOutput[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM sales_transactions";
        query += gh.buildSqlConditions(data, sort);
        let headers: SalesTransactions[] = (await conn.query(query)).recordset;
        let result: PurchasesTransactionOutput[] = [];
        headers.forEach(async (h) => {
            const newRow: PurchasesTransactionOutput = {
                header: h,
                details: showDetails ? await readSalesDetails(h.transact_id) : undefined
            };
            result.push(newRow);
        });

        return result;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    } finally {
        await conn.close();
    }
};

export const insertSalesTransaction = async (data: SalesTransactions, details: TransactionDetails[]): Promise<SalesTransactions> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("sales_transactions", data, request);
        await request.query(query);
        await transaction.commit();
        for (const d of details) {
            await insertSalesDetails(d);

            const newStockOut: StockTypes.StockMovement = {
                direction: "OUT",
                stock_id: d.stock_id,
                transact_id: data.transact_id,
                quantity_change: d.item_quantity,
                movement_date: data.transact_date
            };

            await insertStockMovement(newStockOut);
        }
        
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

export const updateSalesTransaction = async (transact_id: string, data: SalesTransactions, details: TransactionDetails[]): Promise<PurchasesTransactionOutput> => {
    const conn = await sql.connect(sqlConfig);
    let transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("sales_transactions", data, {transact_id}, request);
        await request.query(query);
        await transaction.commit();
        
        await deleteSalesDetails(transact_id);
        
        for (const d of details) {
            await insertSalesDetails(d);

            const newStockOut: StockTypes.StockMovement = {
                direction: "OUT",
                stock_id: d.stock_id,
                transact_id: data.transact_id,
                quantity_change: d.item_quantity,
                movement_date: data.transact_date
            };

            await insertStockMovement(newStockOut);
        }
        return (await readSalesTransactions({transact_id}, true))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        await conn.close();
    }
};

export const deleteSalesTransaction = async (id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = `DELETE FROM purchass_transaction WHERE transact_id = '${id}'`;
        const result = await request.query(query);
        await transaction.commit();
        
        await deleteSalesDetails(id);
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        await conn.close();
    } 
};

export const readSalesDetails = async (transact_id: string): Promise<TransactionDetails[]> => {
    const conn = await sql.connect(sqlConfig);
    let query = `SELECT * FROM sales_details_transactions WHERE transact_id = '${transact_id}'`;
    const result = await conn.query(query);
    return result.recordset;
};

export const insertSalesDetails = async (data: TransactionDetails): Promise<TransactionDetails> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("sales_transactions_details", data, request);
    await request.query(query);
    await transaction.commit();
    return (await readSalesDetails(data.transact_id))[0];
};

export const deleteSalesDetails = async (transact_id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const query = `DELETE FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await conn.query(query);
    const movementID = await readStockMovement({transact_id, direction: "IN"});
    if (movementID) {
        for (const m of movementID) {
            await deleteStockMovement(m.movement_id!);
        }
    }
    return result.rowsAffected.length > 0;
};

export const getSalesDetailIDs = async (transact_id: string): Promise<string[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        const query = `SELECT detail_id FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
        const result = await conn.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};
