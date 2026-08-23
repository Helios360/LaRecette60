import { getOrdersForDay } from "$lib/server/admin";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const raw = url.searchParams.get("date");
    const date = raw ? new Date(raw) : new Date();
    if (Number.isNaN(date.getTime())) {
        return { production: [], date: new Date(), error: "Date invalide" };
    }
    const orders = await getOrdersForDay(date);
    const production = groupForProduction(orders);
    return { production, date, error: null };
};

function groupForProduction(orders: any[]) {
    const map = new Map<string, { title: string; slug: string; quantity: number; totalPrice: number; slicesList: string[]; clients: { name: string; time: string; message: string | null }[] }>();
    for (const o of orders) {
        const client = o.user_fname ?? o.user_name ?? o.user_email ?? "Invité";
        const time = o.delivery_date ? new Date(o.delivery_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—";
        for (const it of (o.items ?? [])) {
            const key = it.article_id;
            if (!map.has(key)) {
                map.set(key, { title: it.title ?? `#${key}`, slug: it.slug ?? "", quantity: 0, totalPrice: 0, slicesList: [], clients: [] });
            }
            const g = map.get(key)!;
            g.quantity += Number(it.quantity);
            g.totalPrice += Number(it.unit_price);
            g.slicesList.push(`${it.quantity}× ${it.slices} parts`);
            g.clients.push({ name: client, time, message: o.customer_message ?? null });
        }
    }
    return Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));
}