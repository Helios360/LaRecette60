# La Recette 60

Site fait par Hellios pour sa maman adorée ( I love you mom :D )

## Lancement avec Docker

Tout est conteneurisé : aucun besoin d'installer Node.js ou MySQL en local.

```sh
cp .env.example .env   # ajuster les valeurs si besoin
docker compose up
```

Trois services démarrent :

| Service  | URL                       | Rôle                          |
| -------- | ------------------------- | ----------------------------- |
| app      | http://localhost:5173     | App SvelteKit (hot reload)    |
| mysql    | localhost:3305            | Base MySQL 8                  |
| adminer  | http://localhost:8080     | Interface web pour MySQL      |

Au premier démarrage, MySQL exécute automatiquement `db/init/01-init.sql`
(schéma) puis `db/seed.sql` (données).

Le code de `la-recette/` est monté en bind mount : modifier un fichier
recharge automatiquement l'app via Vite.

## Arrêter / nettoyer

```sh
docker compose down        # stoppe les conteneurs
docker compose down -v     # + supprime le volume MySQL (reset complet)
```
