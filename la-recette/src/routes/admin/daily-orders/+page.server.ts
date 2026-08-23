import { getOrdersForDay } from "$lib/server/admin";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
    const raw = url.searchParams.get("date");
    const date = raw ? new Date(raw) : new Date();
    if (Number.isNaN(date.getTime())) {
        return { orders: [], date: new Date(), error: "Date invalide" };
    }
    const orders = await getOrdersForDay(date);
    return { orders, date, error: null };
};