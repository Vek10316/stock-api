import sql from 'mssql';
import { getPool } from '../../../config/db';
import * as gh from '../../global/globalHelpers';
import type { SqlSort } from '../../global/globalHelpers';
import type { PurchasesTransactions } from './purchases.types';
import type { TransactionDetails } from '../shared.transactions.types';
import type { Supplier, SupplierVehicles } from '../../clients/supplier/supplier.types';

export const readPurchasesTransactions = async (filter?: Partial<PurchasesTransactions>, sort?: SqlSort): Promise<PurchasesTransactions[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM purchases_transactions";
        query += await gh.buildSqlConditions(filter ?? {}, { sort });
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const insertPurchasesTransaction = async (data: PurchasesTransactions, details: Omit<TransactionDetails, "detail_id">[]): Promise<PurchasesTransactions> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("purchases_transactions", data, transaction, request);

        await request.query(query);

        for (const d of details) {
            await insertPurchasesDetails(d, transaction);
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

export const updatePurchasesTransaction = async (transact_id: string, data: Partial<Omit<PurchasesTransactions, "transact_id">>, details: Omit<TransactionDetails, "detail_id">[]): Promise<PurchasesTransactions> => {
    const pool = await getPool()
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("purchases_transactions", data, { transact_id }, transaction, request);
        await request.query(query);

        // Delete then re-insert details. Update does not delete removed details. + Simplicity
        await deletePurchasesDetails(transact_id, transaction, request);

        for (const d of details) {
            await insertPurchasesDetails(d, transaction, request);
        }

        await transaction.commit();
        return (await readPurchasesTransactions({ transact_id }))[0];
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

export const deletePurchasesTransaction = async (id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    const request = new sql.Request(transaction);
    try {
        await transaction.begin();
        const query = `DELETE FROM purchases_transactions WHERE transact_id = '${id}'`;
        const result = await request.query(query);
        await deletePurchasesDetails(id, transaction, request);

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

export const readPurchasesDetails = async (transact_id: string): Promise<TransactionDetails[]> => {
    const pool = await getPool();
    let query = `SELECT * FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await pool.query(query);
    return result.recordset;
};

export const insertPurchasesDetails = async (data: Omit<TransactionDetails, "detail_id">, transaction: sql.Transaction, request?: sql.Request): Promise<boolean> => {
    request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("purchases_transactions_details", data, transaction, request);
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
};

export const updatePurchaseDetails = async (detail_id: number, updateData: Partial<TransactionDetails>, transaction: sql.Transaction): Promise<boolean> => {
    const query = await gh.buildSqlUpdateQuery("purchases_transactions_details", updateData, { detail_id }, transaction);
    const request = new sql.Request(transaction);
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
}

export const deletePurchasesDetails = async (transact_id: string, transaction: sql.Transaction, request?: sql.Request): Promise<boolean> => {
    if (!request) {
        request = new sql.Request(transaction);
    }
    const query = `DELETE FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
    const result = await request.query(query);
    return result.rowsAffected.length > 0;
};

export const getPurchasesDetailIDs = async (transact_id: string): Promise<string[]> => {
    const pool = await getPool();
    try {
        const query = `SELECT detail_id FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const readFullPurchaseDetails = async (filter?: Partial<PurchasesTransactions>):
    Promise<{
        header: PurchasesTransactions,
        details: TransactionDetails[],
        supplier: Supplier,
        vehicles: SupplierVehicles[],
    }[]> => {
    const pool = await getPool();
    let query = await `SELECT P.*,
        -- DETAILS
        D.detail_id, D.stock_id, D.item_price,
        D.item_quantity, D.transact_subtotal,

        -- SUPPLIER
        S.supplier_id_type, S.supplier_name, S.supplier_address,
        S.supplier_phone, S.supplier_email, S.supplier_tin,

        -- SUPPLIER VEHICLES
        V.vehicle_id, V.plate_no

        FROM purchases_transactions AS P
        LEFT JOIN purchases_transactions_details AS D
        ON P.transact_id = D.transact_id
        LEFT JOIN master_supplier AS S
        ON P.supplier_id = P.supplier_id
        LEFT JOIN supplier_vehicles AS V
        ON P.supplier_id = V.supplier_id
    `;
    query += await gh.buildSqlConditions(query);
    const result = (await pool.query(query)).recordset;
    let response = new Map<string, {
        header: PurchasesTransactions;
        details: TransactionDetails[];
        supplier: Supplier;
        vehicles: SupplierVehicles[];
    }>();

    for (const row of result) {
        if (!response.has(row.transact_id)) {
            response.set(row.transact_id, {
                header: {
                    transact_id: row.transact_id,
                    supplier_id: row.supplier_id,
                    transact_address: row.transact_address,
                    transact_date: row.transact_date,
                    transact_total_amount: row.transact_total_amount,
                    transact_status: row.transact_status,
                },
                details: [],
                supplier: {
                    supplier_id: row.supplier_id,
                    supplier_id_type: row.supplier_id_type,
                    supplier_name: row.supplier_name,
                    supplier_address: row.supplier_address,
                    supplier_phone: row.supplier_phone,
                    supplier_email: row.supplier_email,
                    supplier_tin: row.supplier_tin,
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
            response.get(row.supplier_id)!.vehicles.push({
                vehicle_id: row.vehicle_id,
                supplier_id: row.supplier_id,
                plate_no: row.plate_no,
            })
        }
    }
    return Array.from(response.values());
}

export const getPurchasedTotalQuantity = async (transact_id: string): Promise<number> => {
    const pool = await getPool();
    const query = `SELECT SUM(item_quantity) as total_quantity FROM purchases_transactions_details WHERE transact_id = '${transact_id}'`;
    const result: { total_quantity: number } = (await pool.query(query)).recordset[0];
    return result.total_quantity;
};

export const readPurchasesByDateRange = async (startDate: Date, endDate: Date): Promise<PurchasesTransactions[]> => {
    const pool = await getPool();
    const query = `SELECT * FROM purchases_transactions WHERE transact_date BETWEEN ${startDate.toLocaleDateString("en-CA")} AND ${endDate.toLocaleDateString("en-CA")}`;
    const result = (await pool.query(query)).recordset;
    return result;
};

export const readPurchasesTotalByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<PurchasesTransactions, "transact_total_amount">> => {
    const pool = await getPool();
    const start = startDate.toLocaleDateString('en-CA');
    const end = endDate.toLocaleDateString('en-CA');
    const query = `SELECT SUM(transact_total_amount) as transact_total_amount FROM purchases_transactions WHERE transact_date BETWEEN '${start}' AND '${end}'`
    const result = (await pool.query(query)).recordset[0].transact_total_amount as Pick<PurchasesTransactions, "transact_total_amount">;
    return result;
}

export const readPurchasedItemsByDateRange = async (startDate: Date, endDate: Date): Promise<Pick<TransactionDetails, "stock_id" | "item_quantity">[]> => {
    const pool = await getPool();
    const start = startDate.toLocaleDateString('en-CA');
    const end = endDate.toLocaleDateString('en-CA');
    const query = `SELECT stock_id, SUM(item_quantity) AS item_quantity FROM purchases_transactions_details WHERE transact_id IN (` +
        `SELECT transact_id FROM purchases_transactions WHERE transact_date BETWEEN '${start}' AND '${end}'` +
        `) GROUP BY stock_id;`;
    const result = (await pool.query(query)).recordset as TransactionDetails[];
    return result.map(res => ({
        stock_id: res.stock_id,
        item_quantity: res.item_quantity
    }));
}