import { getPool } from "../../config/db";
import * as gh from "../../utils/globalHelpers";
import sql from "mssql";
import type { 
    BukkuContactsSettings,
    BukkuBuyers,
    BukkuSuppliers
} from "./export-to-bukku.types";
import { ApiPaginatedResponse } from "../../types/api-response.type";
import { SqlClauseOptions } from "../../utils/globalHelpers";

export const readLatestContactCode = async (contact_type: "BUYER" | "SUPPLIER") => {
    const pool = await getPool();
    const query = `SELECT FROM bukku_contacts_settings WHERE contact_type = '${contact_type}'`;
    const result = await pool.query(query);
    return result.recordset;
};

export const updateLatestContactCode = async (contact_type: "BUYER" | "SUPPLIER", latest_contact_code: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const updateData: Pick<BukkuContactsSettings, "latest_contact_code"> = {
            latest_contact_code: latest_contact_code.toUpperCase()
        };
        const updateCondition: Pick<BukkuContactsSettings, "contact_type"> = {
            contact_type
        };
        const updateQuery = await gh.buildSqlUpdateQuery("bukku_ocntacts_settings", updateData, updateCondition, transaction, request);

        const result = await request.query(updateQuery);

        await transaction.commit();
        return result.rowsAffected[0] > 0;
    } catch (err: any) {
        await transaction.rollback();
        console.error(err.message);
        throw err;
    }
};

export const readAllBuyerBukkuContactCode = async (filter?: SqlClauseOptions): Promise<BukkuBuyers[]> => {
    const pool = await getPool();
    const query = `SELECT * FROM bukku_buyers`;
    const result = await pool.query(query);
    return result.recordset[0];
}

export const readBuyerBukkuContactCode = async (buyer_id: string): Promise<BukkuBuyers> => {
    const pool = await getPool();
    const query = `SELECT * FROM bukku_buyers WHERE buyer_id = '${buyer_id}'`;
    const result = await pool.query(query);
    return result.recordset[0];
};

export const insertBuyerContactCode = async (buyer_id: string, contact_code: string): Promise<BukkuBuyers> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const insertData = {
            buyer_id,
            contact_code
        };
        const insertQuery = await gh.buildSqlInsertQuery("bukku_buyers", insertData, transaction, request);
        await request.query(insertQuery);
        await transaction.commit();
        return insertData as BukkuBuyers;
    } catch (err: any) {
        await transaction.rollback();
        console.error(err.message);
        throw err;
    }
};

export const readAllSupplierBukkuContactCode = async (): Promise<BukkuSuppliers[]> => {
    const pool = await getPool();
    const query = `SELECT * FROM bukku_suppliers`;
    const result = await pool.query(query);
    return result.recordset[0];
}

export const readSupplierBukkuContactCode = async (supplier_id: string): Promise<BukkuSuppliers> => {
    const pool = await getPool();
    const query = `SELECT * FROM bukku_suppliers WHERE supplier_id = '${supplier_id}'`;
    const result = await pool.query(query);
    return result.recordset[0];
};

export const insertSupplierContactCode = async (supplier_id: string, contact_code: string): Promise<BukkuSuppliers> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const insertData = {
            supplier_id,
            contact_code
        };
        const insertQuery = await gh.buildSqlInsertQuery("bukku_buyers", insertData, transaction, request);
        await request.query(insertQuery);
        await transaction.commit();
        return insertData as BukkuSuppliers;
    } catch (err: any) {
        await transaction.rollback();
        console.error(err.message);
        throw err;
    }
};