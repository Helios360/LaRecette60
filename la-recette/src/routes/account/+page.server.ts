import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    cancelCart,
    clearCart,
    getCartHistoryForUser,
    getCartItems,
    resolveCart
} from "$lib/server/cart";
import { db } from "$lib/server/db";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    const user = locals.user ?? null;
    const currentCart = await resolveCart(cookies, user);

    let history: any[] = [];
    if (user) {
        const carts = await getCartHistoryForUser(user.id);
        history = await Promise.all(
            carts
                .filter((c) => c.id !== currentCart?.id)
                .map(async (c) => ({ ...c, items: await getCartItems(c.id) }))
        );
    }

    return { user, currentCart, history };
};

export const actions: Actions = {
    cancelCurrentCart: async ({ cookies, locals }) => {
        const user = locals.user ?? null;
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: "Aucun panier à annuler" });
        await cancelCart(cart.id, user?.id ?? null);
        if (!user) cookies.delete("cart_id", { path: "/" });
        return { success: true, message: "Panier annulé" };
    },
    clearCurrentCart: async ({ cookies, locals }) => {
        const user = locals.user ?? null;
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: "Aucun panier à vider" });
        await clearCart(cart.id);
        return { success: true, message: "Panier vidé" };
    },
    exportData: async ({ locals }) => {
        const user = locals.user ?? null;
        if (!user) return fail(401, { error: "Non connecté" });

        const [userRows] = await db.query(`SELECT * FROM user WHERE id = ?`, [user.id]);
        const [sessionRows] = await db.query(`SELECT * FROM session WHERE userId = ?`, [user.id]);
        const [accountRows] = await db.query(`SELECT id, accountId, providerId, userId, createdAt, updatedAt FROM account WHERE userId = ?`, [user.id]);
        const carts = await getCartHistoryForUser(user.id);
        const cartsWithItems = await Promise.all(
            carts.map(async (c) => ({ ...c, items: await getCartItems(c.id) }))
        );

        const payload = {
            exportedAt: new Date().toISOString(),
            user: (userRows as any[])[0] ?? null,
            sessions: sessionRows,
            accounts: accountRows,
            carts: cartsWithItems
        };
        return { success: true, message: "Export prêt", export: payload };
    }
};
