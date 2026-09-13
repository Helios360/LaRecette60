import { env } from "$env/dynamic/private";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
});

export const db = {
    query: async (sql: string, params?: any[]) => {
        // mysql2 uses ? natively — no conversion needed
        const [rows] = await pool.query(sql, params);
        // For SELECT: rows is an array of row objects
        // For INSERT/UPDATE/DELETE: rows is a ResultSetHeader
        return [rows as any];
    },
};

// better-auth auto-detects mysql2 pool via `getConnection` method
export { pool };