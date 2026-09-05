# HouseMe

Verified, affordable housing for students, NYSC corps members, and interns relocating across Nigeria. Landlords list directly. Every listing is reviewed before it goes live.

This repo is the MVP scaffold: Next.js App Router, Drizzle schema, UI shell, and API stubs. Feature logic is not implemented yet.

## Stack

- Next.js 15 (App Router, TypeScript)
- Tailwind CSS
- Drizzle ORM + PostgreSQL 15
- Auth.js v5 (installed, not wired)
- Vitest + Playwright (config + one unit smoke test)

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app starts **without** a database.

Optional Postgres (needed later for listings/auth):

```bash
docker compose up -d
npm run db:migrate
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test:unit` | Vitest unit tests |
| `npm run db:migrate` | Apply `drizzle/0000_init.sql` |
| `npm run db:seed` | Seed stub (not implemented) |

## Routes

Public: `/`, `/search`, `/listings/[id]`, `/about`, `/how-it-works`, `/auth/*`

Dashboards: `/dashboard/landlord/*`, `/dashboard/tenant/*`, `/dashboard/admin/*`

Live API: `GET /api/health`. Other `/api/*` routes return `501` until features are built.

## What to build next

1. Auth (register, verify, login, role guards)
2. Listing create/edit + `pending_review`
3. Admin approve/reject
4. Public search + listing detail
5. Favorites + contact CTA
6. Resend, Cloudinary, Mapbox
7. Seed data and deploy (Vercel + Railway)
