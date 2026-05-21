import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { getOrder, listOrders, updateOrder } from "$lib/server/admin";

const STATUSES = new Set(["pending", "completed", "cancelled"]);
const AGENDA_MONTHS = 3;

function monthBounds(year: number, month: number) {
    const from = new Date(Date.UTC(year, month, 1));
    const to = new Date(Date.UTC(year, month + 1, 1));
    return { from, to };
}

export const load: PageServerLoad = async ({ url }) => {
    const now = new Date();
    const year = Number(url.searchParams.get("year") ?? now.getFullYear());
    const month = Number(url.searchParams.get("month") ?? now.getMonth());
    const safeYear = Number.isFinite(year) ? year : now.getFullYear();
    const safeMonth = Number.isFinite(month) && month >= 0 && month <= 11 ? month : now.getMonth();

    const { from: monthFrom, to: monthTo } = monthBounds(safeYear, safeMonth);
    const agendaFrom = monthFrom;
    const agendaTo = new Date(Date.UTC(safeYear, safeMonth + AGENDA_MONTHS, 1));

    const [orders, agenda] = await Promise.all([
        listOrders({ from: monthFrom, to: monthTo }),
        listOrders({ from: agendaFrom, to: agendaTo })
    ]);

    const selectedId = url.searchParams.get("selected");
    const selected = selectedId ? await getOrder(selectedId) : null;

    return {
        year: safeYear,
        month: safeMonth,
        agendaMonths: AGENDA_MONTHS,
        orders,
        agenda,
        selected
    };
};

export const actions: Actions = {
    update: async ({ request }) => {
        const form = await request.formData();
        const id = String(form.get("id") ?? "");
        if (!id) return fail(400, { error: "ID manquant" });

        const status = String(form.get("status") ?? "");
        if (!STATUSES.has(status)) return fail(400, { error: "Statut invalide" });

        const rawDate = String(form.get("delivery_date") ?? "").trim();
        let delivery_date: Date | null = null;
        if (rawDate) {
            const parsed = new Date(rawDate);
            if (Number.isNaN(parsed.getTime())) return fail(400, { error: "Date invalide" });
            delivery_date = parsed;
        }

        const customer_message = String(form.get("customer_message") ?? "").trim() || null;

        await updateOrder(id, { status, delivery_date, customer_message });
        return { success: true, message: "Commande mise à jour" };
    }
};
