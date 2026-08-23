import { db } from "$lib/server/db";
import { error, fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { addItemToCart } from "$lib/server/cart";

export const load: PageServerLoad = async ({ params }) => {
    const [rows] = await db.query(
        `SELECT * FROM articles WHERE slug = ? LIMIT 1`,
        [params.slug]
    );
    const article = (rows as any[])[0];
    if (!article) throw error(404, "Article introuvable");
    return { article };
};

export const actions: Actions = {
    addToCart: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const form = await request.formData();

        const articleId = Number(form.get('articleId'));
        const slices = Number(form.get('slices'));

        if (!Number.isInteger(articleId) || !Number.isInteger(slices)) {
            return fail(400, { error: 'Invalid form data' });
        }

        // Collect customization options if present
        const options: Record<string, any> = {};
        const rawExtras = form.getAll('extras');
        if (rawExtras.length) {
            options.extras = rawExtras;
        }
        const themeDesc = String(form.get('theme_description') ?? '').trim();
        if (themeDesc) {
            options.theme_description = themeDesc;
        }
        const colors = String(form.get('colors') ?? '').trim();
        if (colors) {
            options.colors = colors;
        }

        await addItemToCart(cookies, user, articleId, slices, options);
        return { success: true };
    },
};
