import { getPool } from '../../config/db';
import type { SqlSort } from '../../utils/globalHelpers';
import * as StockTypes from './stock.types';
import sql from "mssql";
import * as gh from '../../utils/globalHelpers';

export const readStock = async (data?: Partial<StockTypes.Stock>, sqlClauseOptions?: gh.SqlClauseOptions): Promise<StockTypes.Stock[]> => {
    const pool = await getPool();
    let query = "SELECT * FROM master_stock";
    query += await gh.buildSqlConditions(data ?? {}, sqlClauseOptions);
    const result = await pool.query(query);
    return result.recordset;
};

export const readStockCategories = async (): Promise<string[]> => {
    const pool = await getPool();
    let query = "SELECT DISTINCT(stock_category) FROM master_stock";
    const result = await pool.query(query);
    return result.recordset;
}

export const createNewStock = async (data: StockTypes.Stock): Promise<StockTypes.Stock> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("master_stock", data, transaction, request);
        await request.query(query);
        await transaction.commit();
        return data;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error('Rollback failed:', rollbackErr);
        }
        throw err;
    }
};

export const updateStock = async (id: string, updateData: Partial<StockTypes.Stock>): Promise<StockTypes.Stock> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("master_stock", updateData, { stock_id: id }, transaction, request)
        await request.query(query);
        await transaction.commit();
        return (await readStock({ stock_id: id }))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
}

export const deleteStockById = async (stock_id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM master_stock WHERE stock_id = '${stock_id}'`;
        const result = await pool.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const readStockPricingHistory = async (data?: Partial<StockTypes.StockPricingHistory>, sqlClauseOptions?: gh.SqlClauseOptions): Promise<StockTypes.StockPricingHistory[]> => {
    const pool = await getPool();
    let query = "SELECT * FROM stock_pricing_history";
    try {
        const sort: SqlSort = {
            column: "effective_date",
            direction: "DESC"
        };
        if (data) {
            query += await gh.buildSqlConditions(data, { sort: sort });
        }
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        throw err;
    }
};

// Use INSERT to update stock price to preserve history
export const updateStockPrice = async (prices: Omit<StockTypes.StockPricingHistory, "history_id">): Promise<StockTypes.StockPricingHistory> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("stock_pricing_history", prices, transaction, request);
        await request.query(query);
        await transaction.commit();
        return (await readStockPricingHistory(prices))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const deleteStockPrice = async (id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM stock_pricing_history WHERE history_id = '${id}'`;
        const result = await pool.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const readStockMovement = async (data: Partial<StockTypes.StockMovement>): Promise<StockTypes.StockMovement[]> => {
    const pool = await getPool();
    let query = "SELECT * FROM stock_movement";
    query += await gh.buildSqlConditions(data);
    const result = await pool.query(query);
    return result.recordset;
};

export const insertStockMovement = async (data: StockTypes.StockMovement): Promise<StockTypes.StockMovement> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        data.direction = data.direction.toUpperCase();
        const query = await gh.buildSqlInsertQuery("stock_movement", data, transaction, request);
        await request.query(query);
        await transaction.commit();
        let qty = (data.direction === "IN") ? (data.quantity_change) : (data.quantity_change * -1)
        await updateStockQuantity(data.stock_id, qty);
        return data;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const updateStockMovement = async (movement_id: number, data: Partial<StockTypes.StockMovement>): Promise<StockTypes.StockMovement> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    const preUpdateData = (await readStockMovement({ movement_id }))[0];
    let qty: number = 0;

    // REVERT previous qty change
    switch (preUpdateData.direction) {
        case "IN":
            qty = (preUpdateData.quantity_change * -1);
            break;
        case "OUT":
            qty = preUpdateData.quantity_change;
            break;
    }

    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        data.direction = data.direction?.toUpperCase();
        const query = await gh.buildSqlUpdateQuery("stock_movement", data, { movement_id }, transaction, request);
        await request.query(query);

        //Recalculate qty
        switch (data.direction ?? preUpdateData.direction) {
            case "IN":
                qty += data.quantity_change ?? preUpdateData.quantity_change;
                break;
            case "OUT":
                qty -= data.quantity_change ?? preUpdateData.quantity_change;
                break;
        }

        await updateStockQuantity(data.stock_id ?? preUpdateData.stock_id, qty);
        await transaction.commit();
        return (await readStockMovement({ movement_id }))[0];
    } catch (err) {
        console.error(`Unhandled exception `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const deleteStockMovement = async (movement_id: number): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    const d = (await readStockMovement({ movement_id }))[0]
    const qty = d.direction == "IN" ?
        (d.quantity_change * -1) :
        d.quantity_change
    try {
        await transaction.begin()
        const query = `DELETE FROM stock_movement WHERE movement_id = '${movement_id}'`;
        const result = await pool.query(query);
        await transaction.commit();
        await updateStockQuantity(d.stock_id, qty);
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const deleteStockMovementByTransactionID = async (transact_id: string, direction: "IN" | "OUT", stock_id?: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        // Delete all if stock_id isn't provided; else, delete specific stock movement for this transaction
        // Warn: May still have duplicates if stock_id isn't enforced to be unique
        let query = `DELETE FROM stock_movement WHERE transact_id = '${transact_id}' AND direction = '${direction}'`;
        query += stock_id?.trim() !== "" ? ` AND stock_id = '${stock_id}'` : "";

        await transaction.begin()
        const result = await pool.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const updateStockQuantity = async (id: string, quantity: number): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = `UPDATE master_stock SET
    current_quantity = current_quantity + ${quantity}
    WHERE stock_id = '${id}';`;
        const result = await request.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

const readStockQuantity = async (id: string): Promise<number> => {
    const result = await readStock({ stock_id: id });
    return result[0].current_quantity;
};

export const readStockWithPrice = async (data?: Partial<StockTypes.Stock>, sqlClauseOptions?: gh.SqlClauseOptions): Promise<(StockTypes.Stock & { buy_price: number, sell_price: number })[]> => {
    const pool = await getPool();
    let query = `SELECT S.*, P.effective_date, P.buy_price, P.sell_price
    FROM master_stock AS S
    LEFT JOIN stock_pricing_history AS P
    ON S.stock_id = P.stock_id`;

    query += await gh.buildSqlConditions(data ?? {}, {
        prefix: "S"
    });
    const result = (await pool.query(query)).recordset;

    let grouped = new Map<string, StockTypes.Stock & { buy_price: number, sell_price: number }>();

    for (const row of result) {
        if (!grouped.has(row.stock_id)) {
            grouped.set(row.stock_id,
                {
                    stock_id: row.stock_id,
                    stock_description: row.stock_description,
                    stock_uom: row.stock_uom,
                    stock_category: row.stock_category,
                    current_quantity: row.current_quantity,
                    buy_price: row.buy_price,
                    sell_price: row.sell_price,
                },
            );
        }
    }

    const response = Array.from(grouped.values());
    return response;
};