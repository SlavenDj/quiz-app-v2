# Quiz App v2 — rebuild

Same product as `../Quiz-app`, architected right.

- Backend: Express + Prisma + Zod (`apps/api`)
- Frontend: Vite React TS + TanStack Query (`apps/web`)
- DB: SQLite locally, MySQL on cPanel — via dual Prisma schemas

## Quickstart (pnpm)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm --filter api db:push    # create SQLite dev.db
pnpm --filter api db:seed    # admin@plusultra.ba / admin12345
pnpm dev:api                 # :3000
pnpm dev:web                 # :5173
```

## SQLite local / MySQL prod

Prisma 5 forbids `env()` in `provider`, so there are two schemas sharing
identical models (kept in sync — `diff` them if unsure):

- `apps/api/prisma/schema.prisma` — `provider = "sqlite"`, local dev (`db:push`)
- `apps/api/prisma/schema.mysql.prisma` — `provider = "mysql"`, prod migrations

MySQL workflow (docker-compose.yml provides a local MySQL on :3307):

```bash
DATABASE_URL="mysql://root:root@localhost:3307/quiz_db" pnpm --filter api migrate:mysql
# cPanel: import migration SQL via phpMyAdmin, then
# prisma generate --schema=prisma/schema.mysql.prisma && node dist/server.js
```

Portable-SQL rules: no ENUM (String + Zod), no Json type (Stringified),
no `CURDATE()/TIMESTAMPDIFF` — dates/aggregation in JS.

SQLite file lives at `apps/api/prisma/dev.db` (Prisma resolves `file:./dev.db`
relative to the schema dir). Back that file up, not `apps/api/dev.db`.

## cPanel deploy runbook

Assumes `app.plusultra.ba` (static frontend) + `backend.plusultra.ba`
(Passenger Node app), one MySQL DB+user from cPanel.

1. **Frontend:** `pnpm --filter web build` → upload `apps/web/dist/*`
   (incl. hidden `.htaccess` — it's in `apps/web/public/`, Vite copies it
   to `dist/`) to `public_html/` of `app.plusultra.ba`.
   Set `VITE_API_URL=https://backend.plusultra.ba` before building
   (Vite bakes it in at build time — rebuild per environment).
2. **DB:** in phpMyAdmin, import the baseline migration SQL from
   `apps/api/prisma/migrations/*_init/migration.sql` (concatenate in
   filename order if more than one). Verify tables exist.
3. **Backend:** upload `apps/api` (exclude `node_modules`, `dev.db`,
   `dist` — rebuild on server if you have SSH, else upload your local
   `dist/` too). In cPanel Node App Manager set startup file
   `server.js`, Node 20, and env vars from
   `apps/api/.env.production.example` (generate secrets with
   `openssl rand -hex 32`). `COOKIE_DOMAIN=.plusultra.ba` is what lets
   both subdomains share the auth cookies.
4. **Prisma client for MySQL:** the committed client is generated for
   SQLite. On the server (SSH) run
   `prisma generate --schema=prisma/schema.mysql.prisma`; without SSH,
   generate locally against the mysql schema and upload
   `node_modules/.prisma` + `@prisma/client` output.
5. **Seed admin:** `pnpm --filter api db:seed` needs `DATABASE_URL`
   pointing at MySQL + the mysql-generated client; or insert the admin
   row manually. Change the default password immediately.
6. **Uploads:** `public/uploads/` persists on cPanel disk (unlike
   serverless) — no object storage needed. Ensure the dir is writable
   by the app.

Rollback: frontend = re-upload previous `dist/`; backend = previous
folder + no migrations to undo (additive-only policy for now).
