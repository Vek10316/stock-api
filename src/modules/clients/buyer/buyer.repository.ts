import sql from "mssql";
import { sqlConfig } from "../../../config/db";
import { Buyer, BuyerVehicles } from "./buyer.types";
import * as gh from "../../global/globalHelpers";
import type * as ghType from "../../global/globalHelpers";

export const readBuyers = async (data: Partial<Buyer>, sort?: gh.SqlSort): Promise<Buyer[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM master_buyer";
        query += await gh.buildSqlConditions(data, sort ?? {column: "buyer_name"});
        const result = await conn.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        throw err;
    } finally {
        conn.close();
    }
};

export const createBuyer = async (data: Buyer): Promise<Buyer> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlInsertQuery("master_buyer", data, request);
        await request.query(query);
        await transaction.commit();
        return data;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
};

export const updateBuyer = async (id: string, data: Partial<Buyer>): Promise<Buyer> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlUpdateQuery("master_buyer", data, { buyer_id: id }, request);
        const result = await request.query(query);
        await transaction.commit();
        return (await readBuyers({buyer_id: id}))[0];
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
};

export const deleteBuyer = async (id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const query = `DELETE FROM master_buyer WHERE buyer_id = '${id}'`;
        const result = await conn.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
};

export const readBuyerVehicles = async (data: Partial<BuyerVehicles>): Promise<BuyerVehicles[]> =>  {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM buyer_vehicles";
        query += await gh.buildSqlConditions(data);
        const result = await conn.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        throw err;
    } finally {
        conn.close();
    }
};

export const insertBuyerVehicle = async (data: BuyerVehicles): Promise<BuyerVehicles> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("buyer_vehicles", data, request);
        await request.query(query);
        return data;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
};

export const updateBuyerVehicle = async (vehicle_id: number, data: Partial<BuyerVehicles>): Promise<BuyerVehicles> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("buyer_vehicles", data, {vehicle_id}, request);
        await request.query(query);
        await transaction.commit();
        return (await readBuyerVehicles({vehicle_id}))[0];
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
};

export const deleteBuyerVehicle = async (vehicle_id: number): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const query = `DELETE FROM buyer_vehicles WHERE vehicle_id = '${vehicle_id}'`;
        const result = await conn.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: ${rollbackErr}`, err);
        }
        throw err;
    } finally {
        conn.close();
    }
}