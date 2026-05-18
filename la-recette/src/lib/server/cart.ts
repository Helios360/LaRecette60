import { randomUUID } from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from '$lib/server/db';

const CART_COOKIE = 'cart_id';

export type SessionUser = { id: string; } | null;

export async function getGuestCartId(cookies: Cookies) { return cookies.get(CART_COOKIE) ?? null; }

export function setGuestCartCookie(cookies: Cookies, cartId: string) {
	cookies.set(CART_COOKIE, cartId, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true
	});
}

export async function getActiveCartForUser(userId: string) {
	const [rows] = await db.query(
		`
		SELECT *
		FROM carts
		WHERE user_id = ? AND status = 'pending'
		LIMIT 1
		`,
		[userId]
	);
	return (rows as any[])[0] ?? null;
}

export async function getCartById(cartId: string) {
	const [cartRows] = await db.query(
		`
		SELECT *
		FROM carts
		WHERE id = ? AND status = 'pending'
		LIMIT 1
		`,
		[cartId]
	);
	const cart = (cartRows as any[])[0];
	if (!cart) return null;

	const [itemRows] = await db.query(
		`
		SELECT *
		FROM cart_items
		WHERE cart_id = ?
		ORDER BY id DESC
		`,
		[cartId]
	);
	return { ...cart, items: itemRows as any[] };
}

export async function createGuestCart(cookies: Cookies) {
	const id = randomUUID();
	await db.query(
		`
		INSERT INTO carts (id, user_id, status)
		VALUES (?, NULL, 'pending')
		`,
		[id]
	);
	setGuestCartCookie(cookies, id);
	return getCartById(id);
}

export async function createUserCart(userId: string) {
	const id = randomUUID();
	await db.query(
		`
		INSERT INTO carts (id, user_id, status)
		VALUES (?, ?, 'pending')
		`,
		[id, userId]
	);
	return getCartById(id);
}

export async function resolveCart(cookies: Cookies, user: SessionUser) {
	const guestCartId = await getGuestCartId(cookies);
	const guestCart = guestCartId ? await getCartById(guestCartId) : null;
	if (!user) {
		if (guestCart) return guestCart;
		return createGuestCart(cookies);
	}
	let userCart = await getActiveCartForUser(user.id);
	if (!userCart) userCart = await createUserCart(user.id);

	if (guestCart && guestCart.id !== userCart.id) {
		await mergeCartIntoUserCart(guestCart.id, userCart.id);
		setGuestCartCookie(cookies, userCart.id);
		return getCartById(userCart.id);
	}
	setGuestCartCookie(cookies, userCart.id);
	return getCartById(userCart.id);
}

export async function addItemToCart(
	cookies: Cookies,
	user: SessionUser,
	articleId: number,
	slices: number
) {
	const cart = await resolveCart(cookies, user);
	const [existingRows] = await db.query(
		`
		SELECT *
		FROM cart_items
		WHERE cart_id = ? AND article_id = ? AND slices = ?
		LIMIT 1
		`,
		[cart!.id, articleId, slices]
	);
	const existing = (existingRows as any[])[0];
	if (existing) {
		await db.query(
			`
			UPDATE cart_items
			SET
				quantity = quantity + 1,
				unit_price = (quantity + 1) * (slices * (SELECT price FROM articles WHERE id = article_id))
			WHERE id = ?
			`,
			[existing.id]
		);
	} else {
		await db.query(
			`
			INSERT INTO cart_items (cart_id, article_id, slices, quantity, unit_price)
			VALUES (
				?,
				?,
				?,
				1,
				1 * (? * (SELECT price FROM articles WHERE id = ?))
			)
			`,
			[cart!.id, articleId, slices, slices, articleId]
		);
	}
	return getCartById(cart!.id);
}
export async function deleteItemFromCart(
	cookies: Cookies,
	user: SessionUser,
	articleId: number,
	slices: number
) {
	const cart = await resolveCart(cookies, user);
	const [existingRows] = await db.query(
		`
		SELECT *
		FROM cart_items
		WHERE cart_id = ? AND article_id = ? AND slices = ?
		LIMIT 1
		`,
		[cart!.id, articleId, slices]
	);
	const existing = (existingRows as any[])[0];
	if (!existing) return getCartById(cart!.id);
	if (existing.quantity > 1) {
		await db.query(
			`
			UPDATE cart_items
			SET
				quantity = quantity - 1,
				unit_price = (quantity - 1) * (slices * (SELECT price FROM articles WHERE id = article_id))
			WHERE id = ?
			`,
			[existing.id]
		);
	} else {
		await db.query(`DELETE FROM cart_items WHERE id = ?`, [existing.id]);
	}
	return getCartById(cart!.id);
}
export async function mergeCartIntoUserCart(sourceCartId: string, targetCartId: string) {
	const [sourceItemsRows] = await db.query(
		`
		SELECT *
		FROM cart_items
		WHERE cart_id = ?
		`,
		[sourceCartId]
	);
	const sourceItems = sourceItemsRows as any[];
	for (const item of sourceItems) {
		const [existingRows] = await db.query(
			`
			SELECT *
			FROM cart_items
			WHERE cart_id = ? AND article_id = ? AND slices = ?
			LIMIT 1
			`,
			[targetCartId, item.article_id, item.slices]
		);
		const existing = (existingRows as any[])[0];
		if (existing) {
			await db.query(
				`
				UPDATE cart_items
				SET
					quantity = quantity + ?,
					unit_price = (quantity + ?) * (slices * (SELECT price FROM articles WHERE id = article_id))
				WHERE id = ?
				`,
				[item.quantity, item.quantity, existing.id]
			);
		} else {
			await db.query(
				`
				INSERT INTO cart_items (cart_id, article_id, slices, quantity, unit_price)
				VALUES (?, ?, ?, ?, ? * (? * (SELECT price FROM articles WHERE id = ?))
				)
				`,
				[
					targetCartId,
					item.article_id,
					item.slices,
					item.quantity,
					item.quantity,
					item.slices,
					item.article_id
				]
			);
		}
	}
	await db.query(`DELETE FROM cart_items WHERE cart_id = ?`, [sourceCartId]);
	await db.query(`DELETE FROM carts WHERE id = ?`, [sourceCartId]);
}