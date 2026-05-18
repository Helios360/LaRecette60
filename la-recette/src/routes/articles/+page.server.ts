import { db } from "$lib/server/db";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { addItemToCart, deleteItemFromCart, resolveCart } from "$lib/server/cart";

export const load: PageServerLoad = async ({cookies, locals}) => {
    const user = locals.user ?? null;
    const [categoriesRows] = await db.query(`SELECT * FROM categories;`);
    const [articlesRows] = await db.query(`SELECT * FROM articles;`);
    const cart = await resolveCart(cookies, user);
    return { articles: articlesRows, categories: categoriesRows, cart };
};

export const actions: Actions = {
    addToCart: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const form = await request.formData();

        const articleId = Number(form.get('articleId'));
        const slices = Number(form.get('slices'));

        if (!Number.isInteger(articleId) || !Number.isInteger(slices)){
            return fail(400, { error: 'Invalid form data'});
        }
        await addItemToCart(cookies, user, articleId, slices);
        return { success: true };
    },
    deleteFromCart: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const form = await request.formData();

        const articleId = Number(form.get('articleId'));
        const slices = Number(form.get('slices'));

        if (!Number.isInteger(articleId) || !Number.isInteger(slices)){
            return fail(400, { error: 'Invalid form data'});
        }
        await deleteItemFromCart(cookies, user, articleId, slices);
        return { success: true }; 
    },
};