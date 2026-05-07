import { sqlConfig } from '../../config/db';
import type { SqlSort } from '../global/globalHelpers';
import * as StockTypes from './stock.types';
import sql from "mssql";
import * as gh from '../global/globalHelpers';

export const readStock = async (data: Partial<StockTypes.Stock>): Promise<StockTypes.Stock[]> => {
  const conn = await sql.connect(sqlConfig);
  try {
    let query = "SELECT * FROM master_stock";
    if (data) {
      query += await gh.buildSqlConditions(data);
    }
    const result = await conn.query(query);
    return result.recordset;
  } catch (err) {
    throw err;
  } finally {
    conn.close();  
  }
};

export const createNewStock = async (data: StockTypes.Stock): Promise<StockTypes.Stock> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("master_stock", data, request);
    await request.query(query);
    await transaction.commit();
    return data;
  } catch (err) {
    console.error(`Unhandled exception: ${err}`, err);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    throw err;
  } finally {
    await conn.close();
  }
};

export const updateStock = async (id: string, updateData: Partial<StockTypes.Stock>): Promise<StockTypes.Stock> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);    
    const query = await gh.buildSqlUpdateQuery("master_stock", updateData, { stock_id: id }, request)
    await request.query(query);
    await transaction.commit();
    return (await readStock({stock_id: id}))[0];
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
}

export const deleteStockById = async (id: string): Promise<boolean> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  try {
    await transaction.begin();
    const query = `DELETE FROM master_stock WHERE stock_id = '${id}'`;
    const result = await conn.query(query);
    await transaction.commit();
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

export const readStockPricingHistory = async (data: Partial<StockTypes.StockPricingHistory>): Promise<StockTypes.StockPricingHistory[]> => {
  const conn = await sql.connect(sqlConfig);
  let query = "SELECT * FROM stock_pricing_history";
  try {
    const sort: SqlSort = {
      column: "effective_date",
      direction: "DESC"
    };
    if (data) {
      query += await gh.buildSqlConditions(data, sort);
    }
    const result = await conn.query(query);
    return result.recordset;
  } catch (err) {
    throw err;
  } finally {
    conn.close();  
  }
};

// Use INSERT to update stock price to preserve history
export const updateStockPrice = async (data: Partial<StockTypes.StockPricingHistory>): Promise<StockTypes.StockPricingHistory> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    const query = await gh.buildSqlInsertQuery("stock_pricing_history", data, request);
    await request.query(query);
    await transaction.commit();
    return (await readStockPricingHistory(data))[0];
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

export const deleteStockPrice = async (id: string): Promise<boolean> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  try {
    await transaction.begin();
    const query = `DELETE FROM stock_pricing_history WHERE history_id = '${id}'`;
    const result = await conn.query(query);
    await transaction.commit();
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

export const readStockMovement = async (data: Partial<StockTypes.StockMovement>): Promise<StockTypes.StockMovement[]> => {
  const conn = await sql.connect(sqlConfig);
  let query = "SELECT * FROM stock_movement";
  try {
    if (data) {
      query += await gh.buildSqlConditions(data);
    }
    const result = await conn.query(query);
    return result.recordset;
  } catch (err) {
    console.error(`Unhandled exception: ${err}`, err);
    throw err;
  }
};

export const insertStockMovement = async (data: StockTypes.StockMovement): Promise<StockTypes.StockMovement> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  try {
    await transaction.begin();
    const request = new sql.Request(transaction);
    data.direction = data.direction.toUpperCase();
    const query = await gh.buildSqlInsertQuery("stock_movement", data, request);
    const result = await request.query(query);
    await transaction.commit();
    let qty = (data.direction === "IN") ? (data.quantity_change) : (data.quantity_change * -1)
    await updateStockQuantity(data.stock_id, qty);
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

export const updateStockMovement = async (movement_id: number, data: Partial<StockTypes.StockMovement>): Promise<StockTypes.StockMovement> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
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
    const query = await gh.buildSqlUpdateQuery("stock_movement", data, { movement_id }, request);
    const result = await request.query(query);
    
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
    return (await readStockMovement({movement_id}))[0];
  } catch (err) {
    console.error(`Unhandled exception ${err}`, err);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error(`Rollback failed: ${rollbackErr}`, rollbackErr);
    }
    throw err;
  }
};

export const deleteStockMovement = async (movement_id: number) : Promise<boolean> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
  const d = (await readStockMovement({movement_id}))[0]
  const qty = d.direction == "IN" ?
    (d.quantity_change * -1) :
    d.quantity_change
  try {
    await transaction.begin()
    const query = `DELETE FROM stock_movement WHERE movement_id = '${movement_id}'`;
    const result = await conn.query(query);
    await transaction.commit();
    await updateStockQuantity(d.stock_id, qty);
    return result.rowsAffected.length > 0;
  } catch (err) {
    console.error(`Unhandled exception ${err}`, err);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error(`Rollback failed: ${rollbackErr}`, rollbackErr);
    }
    throw err;
  }
};

const updateStockQuantity = async (id: string, quantity: number): Promise<boolean> => {
  const conn = await sql.connect(sqlConfig);
  const transaction = new sql.Transaction(conn);
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
    console.error(`Unhandled exception: ${err}`, err);
    try {
      await transaction.rollback();
    } catch (rollbackErr) {
      console.error(`Rollback failed: ${rollbackErr}`, rollbackErr);
    }
    throw err;
  }
};

const readStockQuantity = async (id: string): Promise<number> => {
  const result = await readStock({ stock_id: id });
  return result[0].current_quantity;
};