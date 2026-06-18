import sql from 'mssql';
import { getPool } from '../../../config/db';
import * as gh from '../../global/globalHelpers';
import type { SqlSort } from '../../global/globalHelpers';
import type { SalesTransactions } from './sales.types';
import type { TransactionDetails } from '../shared.transactions.types';
import type { Buyer, BuyerVehicles } from '../../clients/buyer/buyer.types';

export const readSalesTransactions = async (filter?: Partial<SalesTransactions>, sort?: SqlSort): Promise<SalesTransactions[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM sales_transactions";
        query += await gh.buildSqlConditions(filter ?? {}, {sort});
        const result = await pool.query(query);
        return result.recordset;
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
        const query = await gh.buildSqlUpdateQuery("sales_transactions", data, {transact_id}, transaction, request);
        await request.query(query);
        
        // Delete then re-insert details. Update does not delete removed details. + Simplicity
        await deleteSalesDetails(transact_id, transaction, request);
        
        for (const d of details) {
            await insertSalesDetails(d, transaction, request);
        }
        
        await transaction.commit();
        return (await readSalesTransactions({transact_id}))[0];
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
    const query = await gh.buildSqlUpdateQuery("sales_transactions_details", updateData, {detail_id}, transaction);
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

export const readFullSaleDetails = async (filter?: Partial<SalesTransactions>):
Promise<{header: SalesTransactions,
    details: TransactionDetails[],
    buyer: Buyer,
    vehicles: BuyerVehicles[],
}[]> => {
    const pool = await getPool();
    let query = await `SELECT P.*,
        -- DETAILS
        D.detail_id, D.stock_id, D.item_price,
        D.item_quantity, D.transact_subtotal,

        -- BUYER
        S.buyer_id_type, S.buyer_name, S.buyer_address,
        S.buyer_phone, S.buyer_email, S.buyer_tin,

        -- BUYER VEHICLES
        V.vehicle_id, V.plate_no

        FROM sales_transactions AS P
        LEFT JOIN sales_transactions_details AS D
        ON P.transact_id = D.transact_id
        LEFT JOIN master_buyer AS S
        ON P.buyer_id = P.buyer_id
        LEFT JOIN buyer_vehicles AS V
        ON P.buyer_id = V.buyer_id
    `;
    query += await gh.buildSqlConditions(query);
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
        if (row.vehicle_id) {
            response.get(row.buyer_id)!.vehicles.push({
                vehicle_id: row.vehicle_id,
                buyer_id: row.buyer_id,
                plate_no: row.plate_no,
            })
        }
    }
    return Array.from(response.values());
}

export const getSaledTotalQuantity = async (transact_id: string): Promise<number> =>{
    const pool = await getPool();
    const query = `SELECT SUM(item_quantity) as total_quantity FROM sales_transactions_details WHERE transact_id = '${transact_id}'`;
    const result: {total_quantity: number} = (await pool.query(query)).recordset[0];
    return result.total_quantity;
};