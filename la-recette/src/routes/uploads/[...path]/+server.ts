import { error } from '@sveltejs/kit';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { UPLOADS_ROOT } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

const MIME_BY_EXT: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
};

export const GET: RequestHandler = async ({ params }) => {
    const rawPath = params.path ?? '';
    if (!rawPath) throw error(404, 'Not found');

    // Resolve and confirm the final path stays inside UPLOADS_ROOT — guards
    // against ../ traversal and absolute-path injection.
    const root = resolve(UPLOADS_ROOT);
    const target = resolve(join(root, normalize(rawPath)));
    if (target !== root && !target.startsWith(root + sep)) {
        throw error(404, 'Not found');
    }

    let stats;
    try {
        stats = await stat(target);
    } catch {
        throw error(404, 'Not found');
    }
    if (!stats.isFile()) throw error(404, 'Not found');

    const ext = extname(target).toLowerCase();
    const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';

    const stream = createReadStream(target);
    return new Response(stream as unknown as ReadableStream, {
        headers: {
            'content-type': contentType,
            'content-length': String(stats.size),
            'cache-control': 'public, max-age=3600',
            'last-modified': stats.mtime.toUTCString()
        }
    });
};
