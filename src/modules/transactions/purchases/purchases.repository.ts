import sql from 'mssql';
import { sqlConfig } from '../../../config/db';
import * as gh from '../../global/globalHelpers';
import type { SqlSort } from '../../global/globalHelpers';
import type { PurchasesTransactions } from './purchases.types';
import type { TransactionDetails, TransactionOutput } from '../shared.transactions.types';
import type * as StockTypes from '../../stock/stock.types';
import { insertStockMovement, deleteStockMovement, readStockMovement } from '../../stock/stock.repository';
import * as transactSettingsRepo from '../settings/transaction-settings.repository';

export const readPurchasesTransactions = async (data: Partial<PurchasesTransactions>, showDetails: boolean, sort?: SqlSort): Promise<TransactionOutput[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM purchases_transactions";
        query += gh.buildSqlConditions(data, sort);
        let headers: PurchasesTransactions[] = (await conn.query(query)).recordset;
        let result: TransactionOutput[] = [];
        headers.forEach(async (h) => {
            const newRow: TransactionOutput = {
                header: h,
                details: showDetails ? await readPurchasesDetails(h.transact_id) : undefined
            };
            result.push(newRow);
        });

        return result;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        throw err;
    } finally {
        await conn.close();
    }
};

export const insertPurchasesTransaction = async (data: PurchasesTransactions, details: TransactionDetails[]): Promise<PurchasesTransactions> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("purchases_transactions", data, request);
        await request.query(query);
        await transaction.commit();
        for (const d of details) {
            await insertPurchasesDetails(d);

            const newStockIn: StockTypes.StockMovement = {
                direction: "IN",
                stock_id: d.stock_id,
                transact_id: data.transact_id,
                quantity_change: d.item_quantity,
                movement_date: data.transact_date
            };

            await insertStockMovement(newStockIn);
        }
        
        return data;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    }
};

export const updatePurchasesTransaction = async (transact_id: string, data: PurchasesTransactions, details: TransactionDetails[]): Promise<TransactionOutput> => {
    const conn = await sql.connect(sqlConfig);
    let transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("purchases_transactions", data, {transact_id}, request);
        await request.query(query);
        await transaction.commit();
        
        await deletePurchasesDetails(transact_id);
        
        for (const d of details) {
            await insertPurchasesDetails(d);

            const newStockIn: StockTypes.StockMovement = {
                direction: "IN",
                stock_id: d.stock_id,
                transact_id: data.transact_id,
                quantity_change: d.item_quantity,
                movement_date: data.transact_date
            };

            await insertStockMovement(newStockIn);
        }
        return (await readPurchasesTransactions({transact_id}, true))[0];
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
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

export const deletePurchasesTransaction = async (id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction();
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = `DELETE FROM purchass_transaction WHERE transact_id = '${id}'`;
        const result = await request.query(query);
        await transaction.commit();
        
        await deletePurchasesDetails(id);
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
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

export const readPurchasesDetails = async (transact_id: string): Promise<TransactionDetails[]> => {
    const conn = await sql.connect(sqlConfig);
    let query = `SELECT * FROM purchases_details_transactions WHERE transact_id = '${transact_id}'`;
    const result = await conn.query(query);
    return result.recordset;
};

export const insertPurchasesDetails = async (data: TransactionDetails): Promise<TransactionDetails> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("purchases_transactions_details", data, request);
    await request.query(query);
    await transaction.commit();
    return (await readPurchasesDetails(data.transact_id))[0];
};

export const deletePurchasesDetails = async (transact_id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const query = `DELETE FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await conn.query(query);
    const movementID = await readStockMovement({transact_id, direction: "IN"});
    if (movementID) {
        for (const m of movementID) {
            await deleteStockMovement(m.movement_id!);
        }
    }
    return result.rowsAffected.length > 0;
};

export const getPurchasesDetailIDs = async (transact_id: string): Promise<string[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        const query = `SELECT detail_id FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
        const result = await conn.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        throw err;
    }
};

export const generateNewTransactionHeaders = async (): Promise<Partial<PurchasesTransactions>> => {
    const nextTransactID = await transactSettingsRepo.generateNextTransactionID("PURCHASES");
    const header = {
        transact_id: nextTransactID,
        transact_address: "22, Jalan Seroja 42, Taman Johor Jaya, 81100 Johor Bahru, Johor",
        transact_date: new Date()
    };
    return header;
};
