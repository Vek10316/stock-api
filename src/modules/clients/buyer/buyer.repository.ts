import sql from "mssql";
import { getPool } from "../../../config/db";
import { Buyer, BuyerVehicles } from "./buyer.types";
import * as gh from "../../../utils/globalHelpers";
import type { ApiPaginatedResponse } from "../../../types/api-response.type";

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

export type ListBuyerResult = Buyer & {
    plate_no: string;
};

export const listBuyers = async (filter?: Partial<Buyer>, sqlClauseOptions?: gh.SqlClauseOptions, search?: string)
: Promise<ApiPaginatedResponse<ListBuyerResult[]> | ListBuyerResult[]> => {
    if (search !== undefined && search?.trim() !== "") {
        sqlClauseOptions = {
            ...sqlClauseOptions,
            search: {
                columns: ["M.buyer_id", "M.buyer_name", "M.buyer_phone", "V.plate_no"],
                searchQuery: search
            }
        };
    };
    sqlClauseOptions = {
        ...sqlClauseOptions,
        alias: "M",
        sort: {
            column: "last_transact_date",
            alias: "M",
            order: "DESC"
        }
    };
    const pool = await getPool();
    let baseQuery = `SELECT M.*, V.plate_no` +
        ` FROM master_buyer AS M` +
        ` LEFT JOIN (` +
        ` SELECT buyer_id, STRING_AGG(plate_no, ', ') AS plate_no` +
        ` FROM buyer_vehicles GROUP BY buyer_id)` +
        ` AS V ON M.buyer_id = V.buyer_id`;
    baseQuery += await gh.buildSqlConditions(filter ?? {}, sqlClauseOptions);
    const data = (await pool.query(baseQuery)).recordset.map(d => ({
        ...d,
        plate_no: d.plate_no !== null ? d.plate_no.split(", ") : []
    })) as ListBuyerResult[];

    if (sqlClauseOptions.pagination === undefined) return data;

    let totalCountQuery = "SELECT COUNT(DISTINCT(M.buyer_id)) AS total_count FROM master_buyer AS M" +
        " LEFT JOIN buyer_vehicles AS V ON M.buyer_id = V.buyer_id";
    totalCountQuery += await gh.buildSqlConditions(filter ?? {}, {
        ...sqlClauseOptions,
        sort: undefined,
        pagination: undefined,
    })
    const totalCount = (await pool.query(totalCountQuery)).recordset[0].total_count;
    const response = {
        data,
        metadata: {
            pageNo: sqlClauseOptions?.pagination.pageNumber,
            pageSize: sqlClauseOptions?.pagination.pageSize,
            totalCount,
            totalPages: Math.ceil(totalCount / (sqlClauseOptions?.pagination.pageSize))
        }
    }
    return response;
};

export const updateBuyerLastTransactDate = async (buyer_id: string, transact_date: Date): Promise<boolean> => {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        const request = new sql.Request(transaction);
        const updateQuery = await gh.buildSqlUpdateQuery(
            "master_buyer",
            { last_transact_date: transact_date },
            { buyer_id },
            transaction,
            request
        );
        const result = await request.query(updateQuery);
        await transaction.commit();
        return result.rowsAffected[0] > 0;
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