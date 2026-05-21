import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

const SITE_URL = 'https://www.larecette60.com';

const STATIC_PATHS: Array<{ loc: string; changefreq: string; priority: string }> = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/articles', changefreq: 'weekly', priority: '0.9' },
    { loc: '/events', changefreq: 'monthly', priority: '0.7' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' }
];

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
    let articles: Array<{ slug: string }> = [];
    try {
        const [rows] = await db.query(
            `SELECT slug FROM articles WHERE slug IS NOT NULL ORDER BY id`
        );
        articles = rows as typeof articles;
    } catch {
        // DB unreachable at sitemap-fetch time — emit the static portion only
        // rather than 500. Better-than-nothing for crawlers.
    }

    const urls = [
        ...STATIC_PATHS.map((p) => ({
            loc: `${SITE_URL}${p.loc}`,
            changefreq: p.changefreq,
            priority: p.priority
        })),
        ...articles.map((a) => ({
            loc: `${SITE_URL}/articles/${escapeXml(a.slug)}`,
            changefreq: 'monthly',
            priority: '0.8'
        }))
    ];

    const body =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls
            .map(
                (u) =>
                    `  <url>\n` +
                    `    <loc>${u.loc}</loc>\n` +
                    `    <changefreq>${u.changefreq}</changefreq>\n` +
                    `    <priority>${u.priority}</priority>\n` +
                    `  </url>`
            )
            .join('\n') +
        `\n</urlset>\n`;

    return new Response(body, {
        headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600'
        }
    });
};
