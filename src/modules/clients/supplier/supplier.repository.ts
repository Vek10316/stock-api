import sql from "mssql";
import { getPool } from "../../../config/db";
import { Supplier, SupplierVehicles } from "./supplier.types";
import * as gh from "../../../utils/globalHelpers";
import type { ApiPaginatedResponse } from "../../../types/api-response.type";

export const readSuppliers = async (data?: Partial<Supplier>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<Supplier[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM master_supplier";
        query += await gh.buildSqlConditions(data ?? {}, sqlClauseOptions);
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

export const readSupplierVehicles = async (data?: Partial<SupplierVehicles>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<SupplierVehicles[]> => {
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["plate_no"],
                searchQuery: search
            }
        }
    };
    const pool = await getPool();
    try {
        let query = "SELECT * FROM supplier_vehicles";
        query += await gh.buildSqlConditions(data ?? {}, sqlClauseOptions);
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

export type ListSupplierResult = Supplier & {
    plate_no: string;
};

export const listSuppliers = async (filter?: Partial<Supplier>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string):
    Promise<ApiPaginatedResponse<ListSupplierResult[]>> => {
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["M.supplier_id", "M.supplier_name", "M.supplier_phone", "V.plate_no"],
                searchQuery: search
            }
        };
    };
    sqlClauseOptions = {
        ...sqlClauseOptions,
        alias: "M"
    };
    const pool = await getPool();
    let baseQuery = `SELECT M.*, V.plate_no` +
        ` FROM master_supplier AS M` +
        ` LEFT JOIN (` +
        ` SELECT supplier_id, STRING_AGG(plate_no, ', ') AS plate_no` +
        ` FROM supplier_vehicles GROUP BY supplier_id)` +
        ` AS V ON M.supplier_id = V.supplier_id`;
    baseQuery += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);
    const data = (await pool.query(baseQuery)).recordset.map(d => ({
        ...d,
        plate_no: d.plate_no !== null ? d.plate_no.split(", ") : []
    }));

    let totalCountQuery = "SELECT COUNT(DISTINCT(M.supplier_id)) AS total_count FROM master_supplier AS M" +
        " LEFT JOIN supplier_vehicles AS V ON M.supplier_id = V.supplier_id";
    totalCountQuery += await gh.buildSqlConditions(filter ?? {}, {
        ...sqlClauseOptions,
        sort: undefined,
        pagination: undefined,
    })
    const totalCount = (await pool.query(totalCountQuery)).recordset[0].total_count;
    const response = {
        data,
        metadata: {
            pageNo: sqlClauseOptions?.pagination?.pageNumber ?? 1,
            pageSize: sqlClauseOptions?.pagination?.pageSize ?? 100,
            totalCount,
            totalPages: Math.ceil(totalCount / (sqlClauseOptions?.pagination?.pageSize ?? 100))
        }
    }
    return response;
};