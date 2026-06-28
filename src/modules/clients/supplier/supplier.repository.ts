import sql from "mssql";
import { getPool } from "../../../config/db";
import { Supplier, SupplierVehicles } from "./supplier.types";
import * as gh from "../../../utils/globalHelpers";

export const readSuppliers = async (data?: Partial<Supplier>, sort?: gh.SqlSort): Promise<Supplier[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM master_supplier";
        query += await gh.buildSqlConditions(data ?? {}, { sort: sort ?? { column: "supplier_name" } });
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const createSupplier = async (data: Supplier): Promise<Supplier> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlInsertQuery("master_supplier", data, transaction, request);
        await request.query(query);
        await transaction.commit();
        return data;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const updateSupplier = async (id: string, data: Partial<Supplier>): Promise<Supplier> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlUpdateQuery("master_supplier", data, { supplier_id: id }, transaction, request)
        await request.query(query);
        await transaction.commit();
        return (await readSuppliers({ supplier_id: id }))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const deleteSupplier = async (id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM master_supplier WHERE supplier_id = '${id}'`;
        const result = await pool.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const readSupplierVehicles = async (data: Partial<SupplierVehicles>): Promise<SupplierVehicles[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM supplier_vehicles";
        query += await gh.buildSqlConditions(data);
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const insertSupplierVehicle = async (data: Omit<SupplierVehicles, "vehicle_id">): Promise<Partial<SupplierVehicles>> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("supplier_vehicles", data, transaction, request);
        await request.query(query);
        await transaction.commit();
        return data;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const updateSupplierVehicle = async (vehicle_id: number, data: Partial<SupplierVehicles>): Promise<SupplierVehicles> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("supplier_vehicles", data, { vehicle_id }, transaction, request);
        await request.query(query);
        await transaction.commit();
        return (await readSupplierVehicles({ vehicle_id }))[0];
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
};

export const deleteSupplierVehicle = async (vehicle_id: number): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM supplier_vehicles WHERE vehicle_id = '${vehicle_id}'`;
        const result = await pool.query(query);
        await transaction.commit();
        return result.rowsAffected.length > 0;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        try {
            transaction.rollback();
        } catch (rollbackErr) {
            console.error(`Rollback failed: `, rollbackErr);
        }
        throw err;
    }
}

export const readSupplierName = async (supplier_id: string): Promise<string> => {
    const pool = await getPool();
    const query = `SELECT supplier_name from master_supplier WHERE supplier_id = '${supplier_id}'`;
    const result = (await pool.query(query)).recordset[0].supplier_name;
    return result;
};

export const readSuppliersWithVehicles = async (data: Partial<Supplier>): Promise<{ supplier: Supplier, vehicles?: SupplierVehicles[] }[]> => {
    const pool = await getPool();
    let query = `SELECT M.*, V.vehicle_id, V.plate_no
        FROM master_supplier AS M
        LEFT JOIN supplier_vehicles AS V
        ON M.supplier_id = V.supplier_id`;
    query += await gh.buildSqlConditions(data, { prefix: "M" });
    const result = (await pool.query(query)).recordset;
    const grouped = new Map<string, {
        supplier: Supplier;
        vehicles: SupplierVehicles[];
    }>();

    for (const row of result) {
        if (!grouped.has(row.supplier_id)) {
            grouped.set(row.supplier_id, {
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

        if (row.vehicle_id) {
            grouped.get(row.supplier_id)!.vehicles.push({
                vehicle_id: row.vehicle_id,
                supplier_id: row.supplier_id,
                plate_no: row.plate_no,
            });
        }
    }

    const response = Array.from(grouped.values());

    return response;
};