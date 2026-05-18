import { createPool } from "mysql2/promise";
import { env } from "$env/dynamic/private";

export const db = createPool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT ?? 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    timezone: "Z",
});