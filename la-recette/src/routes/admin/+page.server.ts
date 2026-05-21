import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async () => {
    const [[clientsRow]]: any = await db.query(`SELECT COUNT(*) AS n FROM user`);
    const [[articlesRow]]: any = await db.query(`SELECT COUNT(*) AS n FROM articles`);
    const [[pendingRow]]: any = await db.query(
        `SELECT COUNT(*) AS n FROM carts WHERE status = 'pending' AND delivery_date IS NOT NULL`
    );
    const [[completedRow]]: any = await db.query(
        `SELECT COUNT(*) AS n FROM carts WHERE status = 'completed'`
    );
    const [upcomingRows] = await db.query(
        `SELECT c.id, c.delivery_date, c.status, c.total_amount,
                u.name AS user_name, u.email AS user_email
         FROM carts c
         LEFT JOIN user u ON u.id = c.user_id
         WHERE c.delivery_date IS NOT NULL AND c.delivery_date >= NOW()
         ORDER BY c.delivery_date ASC
         LIMIT 5`
    );
    return {
        stats: {
            clients: Number(clientsRow?.n ?? 0),
            articles: Number(articlesRow?.n ?? 0),
            pending: Number(pendingRow?.n ?? 0),
            completed: Number(completedRow?.n ?? 0)
        },
        upcoming: upcomingRows as any[]
    };
};
