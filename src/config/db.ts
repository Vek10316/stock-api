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
};

if (!global._poolPromise) {
    global._poolPromise = new sql.ConnectionPool(sqlConfig)
        .connect()
        .then((pool) => {
            return pool;
        })
        .catch((err) => {
            console.error("Database connection failed", err);
            throw err
        });
};

poolPromise = global._poolPromise;

export async function getPool() {
    return poolPromise;
};