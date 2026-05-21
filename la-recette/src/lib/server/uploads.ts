import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, isAbsolute, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '$env/dynamic/private';

export const MAX_CART_PHOTOS = 3;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_CART_MESSAGE_LENGTH = 1000;

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MIME_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};

// Root for runtime-written files. Must live OUTSIDE the build output so it
// survives redeploys. Override with UPLOADS_DIR (absolute path) in production.
export const UPLOADS_ROOT = (() => {
    const configured = env.UPLOADS_DIR?.trim();
    if (configured) return isAbsolute(configured) ? configured : resolve(configured);
    return join(process.cwd(), 'uploads');
})();

export const CART_PHOTOS_ROOT = join(UPLOADS_ROOT, 'cart-photos');
export const ARTICLE_IMAGES_ROOT = join(UPLOADS_ROOT, 'articles');

export function validateCartPhoto(file: File): string | null {
    if (file.size === 0) return 'Fichier vide';
    if (file.size > MAX_PHOTO_BYTES) {
        const mb = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));
        return `Photo trop lourde (max ${mb} Mo)`;
    }
    if (!ALLOWED_MIMES.has(file.type)) {
        return 'Format non supporté (JPEG, PNG, WEBP, GIF uniquement)';
    }
    return null;
}

export async function saveCartPhotos(cartId: string, files: File[]): Promise<string> {
    const relative = join('cart-photos', cartId);
    const dir = join(CART_PHOTOS_ROOT, cartId);
    await mkdir(dir, { recursive: true });

    for (const file of files) {
        const ext = extname(file.name).toLowerCase() || MIME_EXTENSIONS[file.type] || '';
        const filename = `${randomUUID()}${ext}`;
        const buf = Buffer.from(await file.arrayBuffer());
        await writeFile(join(dir, filename), buf);
    }

    return relative;
}

export function validateArticleImage(file: File): string | null {
    if (file.size === 0) return 'Fichier vide';
    if (file.size > MAX_PHOTO_BYTES) {
        const mb = Math.round(MAX_PHOTO_BYTES / (1024 * 1024));
        return `Image trop lourde (max ${mb} Mo)`;
    }
    if (!ALLOWED_MIMES.has(file.type)) {
        return 'Format non supporté (JPEG, PNG, WEBP, GIF)';
    }
    return null;
}

export async function saveArticleImage(slug: string, file: File): Promise<string> {
    await mkdir(ARTICLE_IMAGES_ROOT, { recursive: true });
    const ext = extname(file.name).toLowerCase() || MIME_EXTENSIONS[file.type] || '';
    const filename = `${slug}-${randomUUID().slice(0, 8)}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(join(ARTICLE_IMAGES_ROOT, filename), buf);
    return `articles/${filename}`;
}

export async function deleteArticleImage(coverImageKey: string | null | undefined) {
    if (!coverImageKey) return;
    const safe = coverImageKey.replace(/^\/+/, '');
    if (!safe.startsWith('articles/')) return;
    try {
        await unlink(join(UPLOADS_ROOT, safe));
    } catch {
        // file may not exist anymore — ignore
    }
}
