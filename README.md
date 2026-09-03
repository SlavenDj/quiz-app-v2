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
