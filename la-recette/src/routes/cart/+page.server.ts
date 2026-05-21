import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import {
    addItemToCart,
    attachCartMetadata,
    cancelCart,
    clearCart,
    completeCart,
    deleteItemFromCart,
    getCartItems,
    resolveCart
} from "$lib/server/cart";
import { db } from "$lib/server/db";
import {
    MAX_CART_MESSAGE_LENGTH,
    MAX_CART_PHOTOS,
    saveCartPhotos,
    validateCartPhoto
} from "$lib/server/uploads";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    const user = locals.user ?? null;
    const cart = await resolveCart(cookies, user);
    const items = cart ? await getCartItems(cart.id) : [];
    return { user, cart, items };
};

export const actions: Actions = {
    addToCart: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const form = await request.formData();
        const articleId = Number(form.get('articleId'));
        const slices = Number(form.get('slices'));
        if (!Number.isInteger(articleId) || !Number.isInteger(slices)) {
            return fail(400, { error: 'Données invalides' });
        }
        await addItemToCart(cookies, user, articleId, slices);
        return { success: true };
    },
    deleteFromCart: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const form = await request.formData();
        const articleId = Number(form.get('articleId'));
        const slices = Number(form.get('slices'));
        if (!Number.isInteger(articleId) || !Number.isInteger(slices)) {
            return fail(400, { error: 'Données invalides' });
        }
        await deleteItemFromCart(cookies, user, articleId, slices);
        return { success: true };
    },
    removeItem: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: 'Aucun panier' });
        const form = await request.formData();
        const itemId = Number(form.get('itemId'));
        if (!Number.isInteger(itemId)) return fail(400, { error: 'Données invalides' });
        await db.query(`DELETE FROM cart_items WHERE id = ? AND cart_id = ?`, [itemId, cart.id]);
        return { success: true, message: 'Article retiré' };
    },
    clearCart: async ({ cookies, locals }) => {
        const user = locals.user ?? null;
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: 'Aucun panier' });
        await clearCart(cart.id);
        return { success: true, message: 'Panier vidé' };
    },
    cancelCart: async ({ cookies, locals }) => {
        const user = locals.user ?? null;
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: 'Aucun panier' });
        await cancelCart(cart.id, user?.id ?? null);
        if (!user) cookies.delete('cart_id', { path: '/' });
        throw redirect(303, '/articles');
    },
    checkout: async ({ request, cookies, locals }) => {
        const user = locals.user ?? null;
        if (!user) return fail(401, { error: 'Vous devez être connecté pour commander' });
        const cart = await resolveCart(cookies, user);
        if (!cart) return fail(400, { error: 'Aucun panier à commander' });
        const items = await getCartItems(cart.id);
        if (!items.length) return fail(400, { error: 'Votre panier est vide' });

        const form = await request.formData();

        const rawDeliveryDate = String(form.get('deliveryDate') ?? '').trim();
        if (!rawDeliveryDate) {
            return fail(400, { error: 'Date de livraison requise' });
        }
        const deliveryDate = new Date(rawDeliveryDate);
        if (Number.isNaN(deliveryDate.getTime())) {
            return fail(400, { error: 'Date de livraison invalide' });
        }
        const minDelivery = new Date(Date.now() + 48 * 60 * 60 * 1000);
        if (deliveryDate < minDelivery) {
            return fail(400, { error: 'La livraison doit être prévue au moins 48 h à l\'avance' });
        }

        const rawMessage = String(form.get('message') ?? '').trim();
        if (rawMessage.length > MAX_CART_MESSAGE_LENGTH) {
            return fail(400, { error: `Message trop long (max ${MAX_CART_MESSAGE_LENGTH} caractères)` });
        }

        const photos = form.getAll('photos').filter(
            (v): v is File => v instanceof File && v.size > 0
        );
        if (photos.length > MAX_CART_PHOTOS) {
            return fail(400, { error: `Maximum ${MAX_CART_PHOTOS} photos autorisées` });
        }
        for (const photo of photos) {
            const err = validateCartPhoto(photo);
            if (err) return fail(400, { error: err });
        }

        const folder = photos.length ? await saveCartPhotos(cart.id, photos) : null;
        await attachCartMetadata(cart.id, rawMessage || null, folder, deliveryDate);
        await completeCart(cart.id, user.id);
        cookies.delete('cart_id', { path: '/' });
        throw redirect(303, '/account');
    }
};
