import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    createCategory,
    deleteCategory,
    getCategory,
    listCategoriesWithCounts,
    updateCategory
} from "$lib/server/admin";

function parseName(form: FormData): { name: string } | { error: string } {
    const name = String(form.get("name") ?? "").trim();
    if (!name) return { error: "Nom requis" };
    if (name.length > 150) return { error: "Nom trop long (max 150)" };
    return { name };
}

export const load: PageServerLoad = async () => {
    const categories = await listCategoriesWithCounts();
    return { categories };
};

export const actions: Actions = {
    create: async ({ request }) => {
        const form = await request.formData();
        const parsed = parseName(form);
        if ("error" in parsed) return fail(400, parsed);

        try {
            await createCategory(parsed.name);
        } catch (e: any) {
            if (e?.code === "ER_DUP_ENTRY") return fail(400, { error: "Nom déjà utilisé" });
            throw e;
        }
        return { success: true, message: "Catégorie créée" };
    },
    update: async ({ request }) => {
        const form = await request.formData();
        const id = Number(form.get("id"));
        if (!Number.isFinite(id)) return fail(400, { error: "ID invalide" });

        const parsed = parseName(form);
        if ("error" in parsed) return fail(400, { id, ...parsed });

        const existing = await getCategory(id);
        if (!existing) return fail(404, { error: "Catégorie introuvable" });

        try {
            await updateCategory(id, parsed.name);
        } catch (e: any) {
            if (e?.code === "ER_DUP_ENTRY") return fail(400, { id, error: "Nom déjà utilisé" });
            throw e;
        }
        return { success: true, message: "Catégorie mise à jour" };
    },
    delete: async ({ request }) => {
        const form = await request.formData();
        const id = Number(form.get("id"));
        if (!Number.isFinite(id)) return fail(400, { error: "ID invalide" });

        const existing = await getCategory(id);
        if (!existing) return fail(404, { error: "Catégorie introuvable" });

        try {
            await deleteCategory(id);
        } catch (e: any) {
            if (e?.code === "ER_ROW_IS_REFERENCED_2") {
                return fail(400, { error: "Catégorie utilisée par des articles — réaffectez-les avant de supprimer" });
            }
            throw e;
        }
        return { success: true, message: "Catégorie supprimée" };
    }
};
