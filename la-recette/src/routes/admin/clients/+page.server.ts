import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { deleteClient, listClients, updateClient } from "$lib/server/admin";
import {
    validateAddress,
    validateCity,
    validateName,
    validatePhone
} from "$lib/validation";

export const load: PageServerLoad = async () => {
    return { clients: await listClients() };
};

export const actions: Actions = {
    update: async ({ request }) => {
        const form = await request.formData();
        const id = String(form.get("id") ?? "");
        if (!id) return fail(400, { error: "ID manquant" });

        const name = String(form.get("name") ?? "").trim();
        const fname = String(form.get("fname") ?? "").trim();
        const phone = String(form.get("phone") ?? "").trim();
        const address = String(form.get("address") ?? "").trim();
        const city = String(form.get("city") ?? "").trim();
        const roleRaw = form.get("role");
        const role = roleRaw === null ? undefined : Number(roleRaw);

        const errs =
            validateName(name, { required: false }) ||
            validateName(fname, { required: false }) ||
            validatePhone(phone, { required: false }) ||
            validateAddress(address, { required: false }) ||
            validateCity(city, { required: false });
        if (errs) return fail(400, { id, error: errs });
        if (role !== undefined && !Number.isFinite(role)) {
            return fail(400, { id, error: "Rôle invalide" });
        }

        await updateClient(id, { name, fname, phone, address, city, role });
        return { success: true, message: "Client mis à jour" };
    },
    delete: async ({ request, locals }) => {
        const form = await request.formData();
        const id = String(form.get("id") ?? "");
        if (!id) return fail(400, { error: "ID manquant" });
        if (id === locals.user?.id) {
            return fail(400, { error: "Vous ne pouvez pas supprimer votre propre compte ici" });
        }
        await deleteClient(id);
        return { success: true, message: "Client supprimé" };
    }
};
