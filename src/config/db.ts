import 'dotenv/config';
import sql from "mssql";

export const sqlConfig = {
    server: process.env.DB_SERVER!,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let poolPromise: Promise<sql.ConnectionPool>;

declare global {
    var _poolPromise: Promise<sql.ConnectionPool> | undefined;
}

const RETRY_INTERVAL = 30_000;

async function connectWithRetry(): Promise<sql.ConnectionPool> {
    while (true) {
        try {
            console.log("Connecting to database...");

            const pool = await new sql.ConnectionPool(sqlConfig).connect();

            console.log("Database connected successfully");

            return pool;
        } catch (err) {
            console.error(
                "Database connection failed. Retrying in 30 seconds...",
                err
            );

            await new Promise(resolve =>
                setTimeout(resolve, RETRY_INTERVAL)
            );
        }
    }
}

if (!global._poolPromise) {
    global._poolPromise = connectWithRetry();
}

poolPromise = global._poolPromise;

export async function getPool() {
    return poolPromise;
}