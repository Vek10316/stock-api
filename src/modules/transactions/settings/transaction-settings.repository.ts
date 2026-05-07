import type { TransactionSettings } from "./transaction-settings.types";
import * as sql from "mssql";
import { sqlConfig } from "../../../config/db";
import * as gh from "../../global/globalHelpers";

export const readTransactionSettings = async (settings: Partial<TransactionSettings>): Promise<TransactionSettings[] | null> => {
    const conn = await sql.connect(sqlConfig);
    let query = `SELECT * FROM transaction_settings`;
    query += settings ? await gh.buildSqlConditions(settings) : "";
    const result = await conn.query(query);
    return result.recordset || null;
};

export const readLatestTransactionID = async (transaction_type: string): Promise<string> => {
    const conn = await sql.connect(sqlConfig);
    const query = `SELECT TOP 1 latest_transaction_id FROM transaction_settings WHERE transaction_type = '${transaction_type}' AND is_active = 1`;
    console.log(`Executing query: ${query}`);
    const result = await conn.query(query);
    return result.recordset[0]?.latest_transaction_id || "0";
};

export const createNewTransactionSetting = async (settings: Omit<TransactionSettings, "id">): Promise<TransactionSettings> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("transaction_settings", {...settings, is_active: false}, request);
        await request.query(query);
        await transaction.commit();
        return settings as TransactionSettings;
        // return (await readTransactionSettings({ transaction_type: settings.transaction_type })) as TransactionSettings;
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

export const updateTransactionSettings = async (id: number, settings: Partial<TransactionSettings>): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("transaction_settings", settings, { id }, request);
        const result = await request.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        return false;
    }
};

export const updateLatestTransactionID = async (transaction_type: "PURCHASES" | "SALES", latest_transaction_id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("transaction_settings", { latest_transaction_id, is_active: true }, { transaction_type }, request);
        const result = await request.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        return false;
    }
};

export const generateNextTransactionID = async ( transaction_type: "PURCHASES" | "SALES" ): Promise<string> => {
  const latestID = await readLatestTransactionID(transaction_type);
  const prefix = (await readTransactionSettings({ transaction_type, is_active: true }))?.[0]?.transaction_prefix || "";

  // Always extract trailing digits
  const match = latestID.match(/(\d+)$/);

  const numericStr = match ? match[1] : "0";
  const numericPart = parseInt(numericStr, 10);

  const nextNumericPart = numericPart + 1;

  const paddedNext = nextNumericPart
    .toString()
    .padStart(numericStr.length, "0");

  return `${prefix}${paddedNext}`;
};

export const switchActiveTransactionSetting = async (transaction_type: "PURCHASES" | "SALES", id: number): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    const currentActiveSetting = await readTransactionSettings({ transaction_type, is_active: true });
    if (!currentActiveSetting || currentActiveSetting.length === 0) {
        return await updateTransactionSettings(id, { is_active: true });
    }
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);

        try {
            const deactivateQuery = await gh.buildSqlUpdateQuery("transaction_settings", { is_active: false }, { id: currentActiveSetting[0].id }, request);
            await request.query(deactivateQuery);
        } catch (deactivateErr) {
            console.error(`Failed to deactivate current setting: ${deactivateErr}`, deactivateErr);
            throw deactivateErr;
        }

        try {
            const activateQuery = await gh.buildSqlUpdateQuery("transaction_settings", { is_active: true }, { id: id }, request);
            await request.query(activateQuery);
        } catch (activateErr) {
            console.error(`Failed to activate new setting: ${activateErr}`, activateErr);
            throw activateErr;
        }

        await transaction.commit();
        return true;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            await transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        return false;
    }
};
