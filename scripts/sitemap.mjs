/** Generates dist/sitemap.xml, dist/robots.txt and dist/llms.txt for the
 *  static demo build so AI agents (and crawlers) can see the whole app.
 *  Run after `vite build`: `node scripts/sitemap.mjs`.
 *  Env: VITE_SITE_URL (e.g. https://user.github.io/repo/), VITE_BASE_PATH (e.g. /repo/). */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = fileURLToPath(new URL(".", import.meta.url));
const dist = path.join(scriptsDir, "..", "apps", "web", "dist");
const site = (process.env.VITE_SITE_URL ?? "http://localhost:4173/").replace(/\/?$/, "/");
const base = process.env.VITE_BASE_PATH ?? "/";

const routes = [
  ["/", "Landing page: hero, register/login CTAs. Redirects to /home when logged in.", false],
  ["/login", "Login (email+password, role redirect; demo quick-login buttons).", false],
  ["/register", "Registration (name, email, password 8+, country, city) -> verify.", false],
  ["/verify/:id", "6-digit email verification (demo accepts any code).", false],
  ["/forgot", "Forgot password (always neutral response).", false],
  ["/reset", "Reset password (email + code + new password).", false],
  ["/home", "Module grid with edition filter.", true],
  ["/modules/:id", "Module detail with quiz list, attempts and scores.", true],
  ["/quiz/:id", "Quiz intro with meta + start button.", true],
  ["/quiz/:id/play", "Timed quiz player (single/multi/text, resume, auto-submit).", true],
  ["/results/:attemptId", "Score hero + per-question review.", true],
  ["/userinfo/:userId", "Public user profile (bio, stats, rank).", true],
  ["/leaderboard", "First-attempt leaderboard with podium.", true],
  ["/profile", "Edit profile, avatar upload, change password.", true],
  ["/admin/modules", "Admin: module CRUD.", "admin"],
  ["/admin/modules/:id", "Admin: quiz list per module.", "admin"],
  ["/admin/quiz/:id/edit", "Admin: quiz builder (TipTap, answers, images).", "admin"],
  ["/admin/quiz/:id/preview", "Admin: play-through preview (no attempts consumed).", "admin"],
];

const withBase = (p) => site + (p === "/" ? "" : p.slice(1));

mkdirSync(dist, { recursive: true });

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(([p]) => `  <url><loc>${withBase(p)}</loc></url>`).join("\n") +
  `\n</urlset>\n`;
writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${withBase("/sitemap.xml")}\n`
);

const pub = routes.filter(([, , g]) => g !== "admin").map(([p, d]) => `- ${p} — ${d}`).join("\n");
const adm = routes.filter(([, , g]) => g === "admin").map(([p, d]) => `- ${p} — ${d}`).join("\n");

const llms = `# +ULTRA Kviz (demo build)

Static demo of a school quiz platform (Bosnian UI). Data is mocked in-browser:
no persistence across refresh (except login session), verification accepts any
6-digit code, uploads are simulated.

## Demo logins
- Student: student@gmail.com / password123
- Admin: admin@plusultra.ba / admin12345

## Rules
- Quizzes: time limit, max 3 attempts, server-side scoring (single = exact id,
  multiple = non-empty exact set, text = normalized compare).
- Leaderboard counts FIRST attempts only.
- Roles: student (play) vs admin (content CRUD at /admin/*).

## Routes (public)
${pub}

## Routes (authenticated)
All /home, /modules/*, /quiz/*, /results/*, /userinfo/*, /leaderboard, /profile
require login. Role admin required for /admin/* (else redirect).

## Routes (admin)
${adm}

## Repo map (full app, this demo = apps/web with mocked API)
- apps/web/src/lib/demo.ts — the entire mocked backend (response shapes = real API)
- apps/web/src/features/{auth,quiz,profile,admin,landing} — UI by domain
- apps/api — real backend (Express + Prisma, SQLite local / MySQL prod), not running here
- scripts/smoke.sh — curl end-to-end against a live backend

## Run the real app locally
pnpm install; DB_PROVIDER sqlite; pnpm --filter api db:push && db:seed;
pnpm dev:api (port 3000) + pnpm dev:web (port 5173).
`;
writeFileSync(path.join(dist, "llms.txt"), llms);

console.log(`sitemap: ${routes.length} routes -> ${dist}`);
