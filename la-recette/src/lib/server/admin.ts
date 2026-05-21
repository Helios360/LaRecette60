import { error, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";

export const ADMIN_ROLE = 1;

export function isAdmin(user: { role?: number | null } | null | undefined): boolean {
    return !!user && Number(user.role) === ADMIN_ROLE;
}

export function requireAdmin(user: { role?: number | null } | null | undefined) {
    if (!user) throw redirect(303, "/account");
    if (!isAdmin(user)) throw error(403, "Accès réservé aux administrateurs");
}

export async function listClients() {
    const [rows] = await db.query(
        `SELECT u.id, u.name, u.fname, u.email, u.phone, u.address, u.city, u.role,
                u.createdAt, u.updatedAt,
                (SELECT COUNT(*) FROM carts c WHERE c.user_id = u.id) AS total_orders
         FROM user u
         ORDER BY u.createdAt DESC`
    );
    return rows as any[];
}

export async function updateClient(
    id: string,
    fields: { name?: string; fname?: string; phone?: string; address?: string; city?: string; role?: number }
) {
    await db.query(
        `UPDATE user
         SET name = COALESCE(?, name),
             fname = COALESCE(?, fname),
             phone = COALESCE(?, phone),
             address = COALESCE(?, address),
             city = COALESCE(?, city),
             role = COALESCE(?, role),
             updatedAt = CURRENT_TIMESTAMP(3)
         WHERE id = ?`,
        [
            fields.name ?? null,
            fields.fname ?? null,
            fields.phone ?? null,
            fields.address ?? null,
            fields.city ?? null,
            fields.role ?? null,
            id
        ]
    );
}

export async function deleteClient(id: string) {
    await db.query(`DELETE FROM user WHERE id = ?`, [id]);
}

export async function listOrders(filters: { from?: Date; to?: Date } = {}) {
    const where: string[] = [];
    const params: any[] = [];
    if (filters.from) { where.push(`c.delivery_date >= ?`); params.push(filters.from); }
    if (filters.to) { where.push(`c.delivery_date < ?`); params.push(filters.to); }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await db.query(
        `SELECT c.id, c.user_id, c.created_at, c.total_amount, c.status,
                c.customer_message, c.photos_folder, c.delivery_date,
                u.name AS user_name, u.fname AS user_fname, u.email AS user_email,
                COALESCE(SUM(ci.unit_price), 0) AS total
         FROM carts c
         LEFT JOIN user u ON u.id = c.user_id
         LEFT JOIN cart_items ci ON ci.cart_id = c.id
         ${whereSql}
         GROUP BY c.id
         ORDER BY c.delivery_date IS NULL, c.delivery_date ASC, c.created_at DESC`,
        params
    );
    return rows as any[];
}

export async function getOrder(id: string) {
    const [orderRows] = await db.query(
        `SELECT c.*, u.name AS user_name, u.fname AS user_fname, u.email AS user_email, u.phone AS user_phone
         FROM carts c
         LEFT JOIN user u ON u.id = c.user_id
         WHERE c.id = ?
         LIMIT 1`,
        [id]
    );
    const order = (orderRows as any[])[0];
    if (!order) return null;
    const [itemRows] = await db.query(
        `SELECT ci.*, a.title, a.slug
         FROM cart_items ci
         LEFT JOIN articles a ON a.id = ci.article_id
         WHERE ci.cart_id = ?
         ORDER BY ci.id DESC`,
        [id]
    );
    return { ...order, items: itemRows as any[] };
}

export async function updateOrder(
    id: string,
    fields: { status?: string; delivery_date?: Date | null; customer_message?: string | null }
) {
    await db.query(
        `UPDATE carts
         SET status = COALESCE(?, status),
             delivery_date = ?,
             customer_message = ?
         WHERE id = ?`,
        [
            fields.status ?? null,
            fields.delivery_date ?? null,
            fields.customer_message ?? null,
            id
        ]
    );
}

export async function listArticlesWithCategory() {
    const [rows] = await db.query(
        `SELECT a.*, cat.name AS category_name
         FROM articles a
         LEFT JOIN categories cat ON cat.id = a.category_id
         ORDER BY a.id DESC`
    );
    return rows as any[];
}

export async function getArticle(id: number) {
    const [rows] = await db.query(`SELECT * FROM articles WHERE id = ? LIMIT 1`, [id]);
    return (rows as any[])[0] ?? null;
}

export async function createArticle(fields: {
    category_id: number | null;
    slug: string;
    title: string;
    subtitle: string;
    cover_image_key: string | null;
    slices: string;
    price: number;
    details_html: string | null;
}) {
    const [result]: any = await db.query(
        `INSERT INTO articles (category_id, slug, title, subtitle, cover_image_key, slices, price, details_html)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            fields.category_id,
            fields.slug,
            fields.title,
            fields.subtitle,
            fields.cover_image_key,
            fields.slices,
            fields.price,
            fields.details_html
        ]
    );
    return result.insertId as number;
}

export async function updateArticle(
    id: number,
    fields: {
        category_id?: number | null;
        slug?: string;
        title?: string;
        subtitle?: string;
        cover_image_key?: string | null;
        slices?: string;
        price?: number;
        details_html?: string | null;
    }
) {
    const sets: string[] = [];
    const params: any[] = [];
    for (const [k, v] of Object.entries(fields)) {
        if (v === undefined) continue;
        sets.push(`${k} = ?`);
        params.push(v);
    }
    if (!sets.length) return;
    params.push(id);
    await db.query(`UPDATE articles SET ${sets.join(", ")} WHERE id = ?`, params);
}

export async function deleteArticle(id: number) {
    await db.query(`DELETE FROM articles WHERE id = ?`, [id]);
}

export async function listCategories() {
    const [rows] = await db.query(`SELECT * FROM categories ORDER BY name`);
    return rows as any[];
}
