import sql from "mssql";
import { getPool } from "../../../config/db";
import { Buyer, BuyerVehicles } from "./buyer.types";
import * as gh from "../../../utils/globalHelpers";

export const readBuyers = async (data?: Partial<Buyer>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<Buyer[]> => {
    const pool = await getPool();
    try {
        let query = "SELECT * FROM master_buyer";
        query += await gh.buildSqlConditions(data ?? {}, sqlClauseOptions);
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const createBuyer = async (data: Buyer): Promise<Buyer> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlInsertQuery("master_buyer", data, transaction, request);
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

export const updateBuyer = async (id: string, data: Partial<Buyer>): Promise<Buyer> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        let query = await gh.buildSqlUpdateQuery("master_buyer", data, { buyer_id: id }, transaction, request)
        await request.query(query);
        await transaction.commit();
        return (await readBuyers({ buyer_id: id }))[0];
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

export const deleteBuyer = async (id: string): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM master_buyer WHERE buyer_id = '${id}'`;
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

export const readBuyerVehicles = async (data?: Partial<BuyerVehicles>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<BuyerVehicles[]> => {
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
        let query = "SELECT * FROM buyer_vehicles";
        query += await gh.buildSqlConditions(data ?? {}, sqlClauseOptions);
        const result = await pool.query(query);
        return result.recordset;
    } catch (err) {
        console.error(`Unhandled exception: `, err);
        throw err;
    }
};

export const insertBuyerVehicle = async (data: Omit<BuyerVehicles, "vehicle_id">): Promise<Partial<BuyerVehicles>> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlInsertQuery("buyer_vehicles", data, transaction, request);
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

export const updateBuyerVehicle = async (vehicle_id: number, data: Partial<BuyerVehicles>): Promise<BuyerVehicles> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const query = await gh.buildSqlUpdateQuery("buyer_vehicles", data, { vehicle_id }, transaction, request);
        await request.query(query);
        await transaction.commit();
        return (await readBuyerVehicles({ vehicle_id }))[0];
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

export const deleteBuyerVehicle = async (vehicle_id: number): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const query = `DELETE FROM buyer_vehicles WHERE vehicle_id = '${vehicle_id}'`;
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

export const readBuyerName = async (buyer_id: string): Promise<string> => {
    const pool = await getPool();
    const query = `SELECT buyer_name from master_buyer WHERE buyer_id = '${buyer_id}'`;
    const result = (await pool.query(query)).recordset[0].buyer_name;
    return result;
};

export const readBuyersWithVehicles = async (data?: Partial<Buyer>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string): Promise<{ buyer: Buyer, vehicles?: BuyerVehicles[] }[]> => {
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["M.buyer_id", "M.buyer_name", "M.buyer_phone", "V.plate_no"],
                searchQuery: search
            }
        };
    };
    const pool = await getPool();
    let query = `SELECT M.*, V.vehicle_id, V.plate_no
        FROM master_buyer AS M
        LEFT JOIN buyer_vehicles AS V
        ON M.buyer_id = V.buyer_id`;
    query += await gh.buildSqlConditions(data ?? {}, { 
        ...sqlClauseOptions,
        prefix: "M"
     });
    const result = (await pool.query(query)).recordset;
    const grouped = new Map<string, {
        buyer: Buyer;
        vehicles: BuyerVehicles[];
    }>();

    for (const row of result) {
        if (!grouped.has(row.buyer_id)) {
            grouped.set(row.buyer_id, {
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

        if (row.vehicle_id) {
            grouped.get(row.buyer_id)!.vehicles.push({
                vehicle_id: row.vehicle_id,
                buyer_id: row.buyer_id,
                plate_no: row.plate_no,
            });
        }
    }

    const response = Array.from(grouped.values());

    return response;
};