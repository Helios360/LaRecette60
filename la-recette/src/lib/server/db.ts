import { env } from "$env/dynamic/private";
import pg from "pg";

const pool = new pg.Pool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 5432),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
});

// Thin wrapper: auto-numbers ? placeholders → $1, $2, ...
// and returns [rows] tuple like mysql2 for backward compat
function prepare(sql: string, params?: any[]) {
    if (!params || params.length === 0) return { text: sql, values: params };
    let idx = 0;
    const text = sql.replace(/\?/g, () => `$${++idx}`);
    return { text, values: params };
}

export const db = {
    query: async (sql: string, params?: any[]) => {
        const { text, values } = prepare(sql, params);
        const result = await pool.query(text, values);
        return [result.rows];
    },
};

// better-auth needs the raw pool passed as `database`
export { pool };