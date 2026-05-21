import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const [categoriesRows] = await db.query(`SELECT id, name FROM categories;`);
    const [articlesRows] = await db.query(
        `SELECT id, category_id, slug, title FROM articles;`
    );
    return { categories: categoriesRows, articles: articlesRows };
};
