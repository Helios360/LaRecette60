# La Recette 60 — Collection Bruno

Collection d'API pour tester l'app SvelteKit avec [Bruno](https://www.usebruno.com/).

## Utilisation

1. Lancer la stack : `docker compose up` (depuis la racine).
2. Ouvrir Bruno → *Open Collection* → sélectionner ce dossier.
3. Sélectionner l'environnement **Local** (en haut à droite).
4. Lancer une requête.

## Structure

| Dossier         | Contenu                                                                |
| --------------- | ---------------------------------------------------------------------- |
| Public          | Pages publiques (`/`, `/articles`, `/events`, `/about`, sitemap)       |
| Auth            | Endpoints better-auth (`/api/auth/*` : sign-up, sign-in, session)      |
| Cart            | Form actions du panier (`/cart?/...`)                                  |
| Account         | Form actions du compte (`/account?/...`)                               |
| Admin Articles  | CRUD admin sur les articles                                            |
| Admin Clients   | Mise à jour / suppression de clients                                   |
| Admin Calendar  | Mise à jour des commandes                                              |

## Variables d'environnement

Définies dans [environments/Local.bru](environments/Local.bru) :

- `baseUrl` — `http://localhost:5173`
- `userEmail`, `userPassword`, `userName`, `userPhone` — compte de test
- `articleId`, `articleSlug`, `adminArticleId` — fixtures issues de `db/seed.sql`
- `clientId`, `orderId`, `cartItemId` — à renseigner depuis Adminer (`http://localhost:8080`)

## Notes

- Les routes `/cart`, `/account` et `/admin/*` sont des **form actions
  SvelteKit** : elles attendent un POST `?/<actionName>` avec un corps
  `application/x-www-form-urlencoded` ou `multipart/form-data`.
- L'authentification se fait par cookie de session (better-auth) : sign-in
  une fois, le cookie est conservé pour les requêtes suivantes dans Bruno.
- L'accès admin nécessite un user avec `role >= 1` en base — éditer le rôle
  via Adminer après inscription.
