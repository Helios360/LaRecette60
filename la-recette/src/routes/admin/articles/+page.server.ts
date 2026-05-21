import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    createArticle,
    deleteArticle,
    getArticle,
    listArticlesWithCategory,
    listCategories,
    updateArticle
} from "$lib/server/admin";
import { deleteArticleImage, saveArticleImage, validateArticleImage } from "$lib/server/uploads";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/;
const SLICES_RE = /^\d+(?:,\d+)*$/;

function parseArticleForm(form: FormData, isCreate: boolean) {
    const slug = String(form.get("slug") ?? "").trim();
    const title = String(form.get("title") ?? "").trim();
    const subtitle = String(form.get("subtitle") ?? "").trim();
    const slices = String(form.get("slices") ?? "").trim().replace(/\s+/g, "");
    const priceRaw = String(form.get("price") ?? "").trim().replace(",", ".");
    const categoryRaw = String(form.get("category_id") ?? "").trim();
    const details = String(form.get("details_html") ?? "").trim();

    if (!slug || !SLUG_RE.test(slug)) return { error: "Slug invalide (a-z, 0-9, -)" };
    if (!title) return { error: "Titre requis" };
    if (title.length > 150) return { error: "Titre trop long (max 150)" };
    if (!subtitle) return { error: "Sous-titre requis" };
    if (subtitle.length > 300) return { error: "Sous-titre trop long (max 300)" };
    if (!slices || !SLICES_RE.test(slices)) return { error: "Parts invalides (ex: 8,10,12)" };
    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) return { error: "Prix invalide" };

    const category_id = categoryRaw ? Number(categoryRaw) : null;
    if (categoryRaw && !Number.isFinite(category_id)) return { error: "Catégorie invalide" };

    return {
        data: {
            slug,
            title,
            subtitle,
            slices,
            price,
            category_id,
            details_html: details || null
        }
    };
}

export const load: PageServerLoad = async () => {
    const [articles, categories] = await Promise.all([
        listArticlesWithCategory(),
        listCategories()
    ]);
    return { articles, categories };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const form = await request.formData();
        const parsed = parseArticleForm(form, true);
        if ("error" in parsed) return fail(400, parsed);

        const image = form.get("image");
        let cover_image_key: string | null = null;
        if (image instanceof File && image.size > 0) {
            const err = validateArticleImage(image);
            if (err) return fail(400, { error: err });
            cover_image_key = await saveArticleImage(parsed.data.slug, image);
        }

        try {
            await createArticle({ ...parsed.data, cover_image_key });
        } catch (e: any) {
            if (e?.code === "ER_DUP_ENTRY") return fail(400, { error: "Slug déjà utilisé" });
            throw e;
        }
        return { success: true, message: "Article créé" };
    },
    update: async ({ request }) => {
        const form = await request.formData();
        const id = Number(form.get("id"));
        if (!Number.isFinite(id)) return fail(400, { error: "ID invalide" });

        const parsed = parseArticleForm(form, false);
        if ("error" in parsed) return fail(400, { id, ...parsed });

        const existing = await getArticle(id);
        if (!existing) return fail(404, { error: "Article introuvable" });

        let cover_image_key: string | undefined = undefined;
        const image = form.get("image");
        if (image instanceof File && image.size > 0) {
            const err = validateArticleImage(image);
            if (err) return fail(400, { id, error: err });
            cover_image_key = await saveArticleImage(parsed.data.slug, image);
            await deleteArticleImage(existing.cover_image_key);
        }

        try {
            await updateArticle(id, { ...parsed.data, cover_image_key });
        } catch (e: any) {
            if (e?.code === "ER_DUP_ENTRY") return fail(400, { id, error: "Slug déjà utilisé" });
            throw e;
        }
        return { success: true, message: "Article mis à jour" };
    },
    delete: async ({ request }) => {
        const form = await request.formData();
        const id = Number(form.get("id"));
        if (!Number.isFinite(id)) return fail(400, { error: "ID invalide" });

        const existing = await getArticle(id);
        if (!existing) return fail(404, { error: "Article introuvable" });

        try {
            await deleteArticle(id);
        } catch (e: any) {
            if (e?.code === "ER_ROW_IS_REFERENCED_2") {
                return fail(400, { error: "Article référencé dans des commandes — impossible à supprimer" });
            }
            throw e;
        }
        await deleteArticleImage(existing.cover_image_key);
        return { success: true, message: "Article supprimé" };
    }
};
