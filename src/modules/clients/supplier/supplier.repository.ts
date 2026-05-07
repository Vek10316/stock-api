import sql from "mssql";
import { sqlConfig } from "../../../config/db";
import { Supplier, SupplierVehicles } from "./supplier.types";
import * as gh from "../../global/globalHelpers";
import type * as ghType from "../../global/globalHelpers";

export const readSuppliers = async (data: Partial<Supplier>, sort?: gh.SqlSort): Promise<Supplier[]> => {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM master_supplier";
        query += await gh.buildSqlConditions(data, sort ?? {column: "supplier_name"});
        const result = await conn.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: ${err}`, err);
        throw err;
    } finally {
        conn.close();
    }
};

export const createSupplier = async (data: Supplier): Promise<Supplier> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlInsertQuery("master_supplier", data, request);
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

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlUpdateQuery("master_supplier", data, { supplier_id: id }, request);
        const result = await request.query(query);
        await transaction.commit();
        return (await readSuppliers({supplier_id: id}))[0];
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

export const deleteSupplier = async (id: string): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const query = `DELETE FROM master_supplier WHERE supplier_id = '${id}'`;
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

export const readSupplierVehicles = async (data: Partial<SupplierVehicles>): Promise<SupplierVehicles[]> =>  {
    const conn = await sql.connect(sqlConfig);
    try {
        let query = "SELECT * FROM supplier_vehicles";
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

export const insertSupplierVehicle = async (data: SupplierVehicles): Promise<SupplierVehicles> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("supplier_vehicles", data, request);
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

export const updateSupplierVehicle = async (vehicle_id: number, data: Partial<SupplierVehicles>): Promise<SupplierVehicles> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("supplier_vehicles", data, {vehicle_id}, request);
        await request.query(query);
        await transaction.commit();
        return (await readSupplierVehicles({vehicle_id}))[0];
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

export const deleteSupplierVehicle = async (vehicle_id: number): Promise<boolean> => {
    const conn = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(conn);
    try {
        await transaction.begin();
        const query = `DELETE FROM supplier_vehicles WHERE vehicle_id = '${vehicle_id}'`;
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