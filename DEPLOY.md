# Deploying La Recette to Hostinger (Node.js)

This app is a SvelteKit project (in `la-recette/`) that builds with
`@sveltejs/adapter-node` and runs as a long-lived Node process. MySQL is
expected to be provided remotely by Hostinger's managed MySQL.

## 1. Provision on Hostinger

1. **Node.js application** — create one in hPanel → *Websites* → *Node.js*.
   - Node version: **20.x or newer** (matches `engines.node` in `package.json`).
   - Application root: the directory you will upload (e.g. `/home/u123/domains/larecette60.com/app`).
   - Application URL: your domain.
   - Application startup file: `build/index.js`
   - Startup command (if asked): `node build`
2. **MySQL database** — create one in hPanel → *Databases* → *MySQL*. Note the
   remote hostname, port, database name, user, and password. Allow remote
   access from the Node app's host if Hostinger requires it.

## 2. Configure environment variables

In the Node.js app's *Environment Variables* panel, set everything from
`la-recette/.env.example`. Minimum required for production:

| Variable | Value |
| --- | --- |
| `HOST` | `0.0.0.0` |
| `PORT` | Whatever Hostinger assigns (often injected automatically — only set if needed) |
| `ORIGIN` | `https://www.larecette60.com` (your public URL, with scheme) |
| `PROTOCOL_HEADER` | `x-forwarded-proto` |
| `HOST_HEADER` | `x-forwarded-host` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | From Hostinger MySQL panel |
| `BETTER_AUTH_SECRET` | 32-byte random string — generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Same as `ORIGIN` |
| `UPLOADS_DIR` | Absolute path to the persistent uploads directory, e.g. `/home/u123/domains/larecette60.com/uploads` |

> `ORIGIN` is mandatory: without it SvelteKit rejects every form POST as a
> CSRF attempt.

## 3. Initialize the database

From your local machine (or the Hostinger SSH terminal):

```sh
# Auth tables (better-auth schema)
cd la-recette
bunx @better-auth/cli@latest migrate   # or: npx @better-auth/cli@latest migrate

# Application tables + seed
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < ../db/init/01-init.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < ../db/seed.sql   # optional
```

## 4. Upload the project

Two common shapes — pick one:

### A. Build locally, upload the built tree

```sh
cd la-recette
npm ci
npm run build
```

Upload these to the Hostinger application root (e.g. via SFTP or Git):

```
build/            # produced by the build step
package.json
package-lock.json
node_modules/     # OR run `npm ci --omit=dev` on the server instead
```

Then start: `node build` (or let Hostinger's Node manager do it).

### B. Build on the server

Upload the full `la-recette/` source (minus `node_modules/`, `.svelte-kit/`,
`build/`, `.env`), then on the server:

```sh
npm ci
npm run build
npm run start
```

## 5. Persistent uploads

Runtime-written files (cart photos, admin-uploaded article cover images) live
under `UPLOADS_DIR`. The bundled output **does not** contain this directory —
it must exist on the server and survive redeploys. Recommended layout:

```
/home/u123/domains/larecette60.com/
├── app/                  ← deploy target (overwritten each release)
└── uploads/              ← persistent; set UPLOADS_DIR to this
    ├── articles/
    └── cart-photos/
```

Files are served by the app itself at:

- `/uploads/articles/<file>` — admin article covers
- `/uploads/cart-photos/<cartId>/<file>` — customer order photos

## 6. Smoke test after deploy

1. `https://your-domain/` — homepage renders.
2. `https://your-domain/articles` — list loads (DB connectivity).
3. Create an account, log in (better-auth + session cookie).
4. As admin, upload an article cover image — confirm it loads under
   `/uploads/articles/...` after save.
5. Add an item to cart as a guest, then log in — guest cart should merge.

## Notes

- The `crypto` npm package was removed; the code uses Node's built-in
  `node:crypto` everywhere.
- `static/images/` is baked into the build. Never write to it at runtime —
  use `UPLOADS_DIR` instead. The admin upload flow already does this.
- If you previously stored article covers under `static/images/articles/` on
  a non-Node deployment, move those files into `$UPLOADS_DIR/articles/`
  before going live (the DB column `articles.cover_image_key` already uses
  the `articles/<filename>` prefix, which now resolves under `/uploads/`).
