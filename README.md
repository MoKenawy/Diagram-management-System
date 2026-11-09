<div align="center">

# Diagram Management System

**نظام إدارة المخططات الهندسية** — a bilingual (AR/EN, full RTL) engineering drawing archive with
role-based access control, immutable version history, and a complete audit trail.

<img src="docs/screenshots/01-login.webp" alt="Login screen" width="100%">

[![Node](https://img.shields.io/badge/Node-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## Contents

- [What it does](#what-it-does)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [Quick start (Docker)](#quick-start-docker)
- [Local development](#local-development)
- [Default accounts](#default-accounts)
- [Configuration](#configuration)
- [Commands](#commands)
- [Project layout](#project-layout)
- [Troubleshooting](#troubleshooting)
- [Documentation](#documentation)

---

## What it does

An internal archive for engineering drawings (PDF, DWG, DXF, PNG, JPG) where every revision is kept
forever and every action is logged. Four roles see four different applications on the same data.

| Capability | Detail |
|---|---|
| **Role-based access** | `ENGINEER`, `DC` (document control), `MANAGER`, `ADMIN` — hierarchical, polymorphic grants with deny-override |
| **Immutable versioning** | A diagram is an identity; each upload is a new, never-rewritten version record |
| **Bilingual UI** | Arabic and English with a complete RTL pass — departments and labels carry both names |
| **Thumbnails** | Generated off the request path by a BullMQ worker (`sharp` + `poppler-utils`) |
| **Audit trail** | Every login, upload, download and admin action recorded with actor, target and IP |
| **Backup & restore** | Operator-triggered jobs with progress, plus replication targets |
| **Reports** | Per-department and per-user statistics, exportable to Excel and PDF |
| **API docs** | Swagger UI served by the backend at `/api/api-docs` |

## Screenshots

<table>
<tr>
<td width="50%"><img src="docs/screenshots/02-admin-dashboard.png" alt="Admin dashboard"><br><sub><b>Admin dashboard</b> — KPIs, system health, recent audit activity</sub></td>
<td width="50%"><img src="docs/screenshots/06-user-management.png" alt="User management"><br><sub><b>User management</b> — roles and departments, filterable</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/screenshots/03-archive-list.png" alt="Archive list view"><br><sub><b>Archive, list view</b> — filter by department, format and date</sub></td>
<td width="50%"><img src="docs/screenshots/04-archive-grid.png" alt="Archive grid view"><br><sub><b>Archive, grid view</b> — thumbnails with revision badges</sub></td>
</tr>
<tr>
<td colspan="2"><img src="docs/screenshots/05-audit-logs.png" alt="Audit logs"><br><sub><b>Audit log</b> — every action with actor, target and source IP</sub></td>
</tr>
</table>

## Architecture

```
                         ┌──────────────────────────┐
  browser  ──:80/:443──► │  nginx  (dms-frontend)   │
                         │  static React build      │
                         │  /api/* ──► backend:3000 │
                         └───────────┬──────────────┘
                                     │
                         ┌───────────▼──────────────┐
                         │  Express 5 (dms-backend) │
                         │  REST API + BullMQ       │
                         │  workers: thumbnails,    │
                         │  backup, restore, repl.  │
                         └──────┬──────────────┬────┘
                                │              │
                   ┌────────────▼───┐   ┌──────▼──────────┐
                   │ PostgreSQL 17  │   │   Redis 7.4     │
                   │   (dms-db)     │   │  (dms-redis)    │
                   └────────────────┘   └─────────────────┘

        host volumes:  ./storage/uploads   ./storage/backups
```

**Backend** — Express 5, Prisma 7, Zod validation, JWT access + refresh cookies, Pino logging, BullMQ queues.

**Frontend** — React 19, Vite, TanStack Router + Query, MUI 7, Tailwind 4, Zustand, Recharts.

## Quick start (Docker)

The fastest path to a running system. Everything — database, cache, API, web — comes up in
containers, the schema is pushed, and the database is seeded with a default admin.

**Requirements:** Docker Desktop (or Docker Engine + Compose v2). Nothing else.

```bash
git clone https://github.com/MoKenawy/Diagram-management-System.git
```

```bash
cd Diagram-management-System/monorepo-app
```

```bash
cp .env.example .env
```

Open `.env` and replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with your own random values:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then bring the stack up:

```bash
docker compose up -d --build
```

The first build takes a few minutes. On start the backend container runs `prisma generate`,
`prisma db push` and `prisma db seed` automatically, so there is no separate migration step.

Watch it finish:

```bash
docker compose logs -f backend
```

When the log prints `Default admin -> username: admin  password: Admin@123`, open:

| | |
|---|---|
| Web app | <http://localhost> |
| API | <http://localhost/api> |
| Health check | <http://localhost/api/health> |
| Swagger UI | <http://localhost/api/api-docs> |

Sign in with **`admin` / `Admin@123`**.

To stop, keeping the data:

```bash
docker compose down
```

To wipe the database and start over:

```bash
docker compose down -v
```

## Local development

Hot reload on both packages, with Postgres and Redis still in Docker.

**Requirements:** Node.js 24+, npm 10+, Docker (for the two data services only).
On Linux, thumbnail generation for PDFs also needs `poppler-utils` (`sudo apt install poppler-utils`).

**1. Install dependencies** from `monorepo-app/` — it is an npm workspaces root, so one install
covers both packages:

```bash
npm install
```

**2. Start Postgres and Redis only:**

```bash
docker compose up -d postgres redis
```

**3. Create the local env files** from the tracked dev templates:

```bash
cp packages/backend/.env.dev packages/backend/.env
```

```bash
cp packages/frontend/.env.dev packages/frontend/.env
```

> Edit `packages/backend/.env` and set `STORAGE_BASE_PATH` to the absolute path of
> `monorepo-app/storage` on your machine — the committed value is another machine's path.
> Replace the JWT secrets in both files as well.

**4. Push the schema and seed:**

```bash
npm run db:push --workspace=@app/backend
```

```bash
npm run db:seed --workspace=@app/backend
```

**5. Run both dev servers:**

```bash
npm run dev --workspaces
```

| | |
|---|---|
| Frontend (Vite) | <http://localhost:5173> |
| Backend (Express) | <http://localhost:3000> |
| Swagger UI | <http://localhost:3000/api/api-docs> |

There are no Prisma migration files in the repo — the schema is applied with `prisma db push`.
Use `npx prisma migrate dev` only if you intend to start a migration history.

## Default accounts

Seeding creates one administrator plus a full set of department users. **Every seeded account uses
the same password:** `Admin@123`.

| Username | Role | Department |
|---|---|---|
| `admin` | ADMIN | — |
| `dc_con` · `mgr_con` · `eng_con` | DC · MANAGER · ENGINEER | الإنشاءات / Construction |
| `dc_tech` · `mgr_tech` · `eng_tech` | DC · MANAGER · ENGINEER | المكتب الفني / Technical Office |
| `dc_del` · `mgr_del` · `eng_del` | DC · MANAGER · ENGINEER | التسليم / Delivery |
| `dc_mnt` · `mgr_mnt` · `eng_mnt` | DC · MANAGER · ENGINEER | الصيانة / Maintenance |
| `dc_irr` · `mgr_irr` · `eng_irr` | DC · MANAGER · ENGINEER | الري / Irrigation |

> **Change the admin password before exposing this to anyone else.** The seed is idempotent — it
> upserts and never overwrites an existing user's password, so a change made in the app is permanent.
> To seed different credentials in the first place, set `SEED_ADMIN_USERNAME` and
> `SEED_ADMIN_PASSWORD` before the seed runs.

## Configuration

`monorepo-app/.env` — read by the backend container via `env_file`:

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection | `postgresql://user:password@postgres:5432/appdb` |
| `REDIS_URL` | Redis connection | `redis://redis:6379` |
| `PORT` | Backend listen port | `3000` |
| `FRONTEND_URL` | CORS origin | `http://localhost:80` |
| `JWT_SECRET` | Access-token signing key | *32-byte random hex* |
| `JWT_REFRESH_SECRET` | Refresh-token signing key | *32-byte random hex* |
| `FILE_STORAGE_PATH` | Upload directory | `./uploads` |
| `BACKUP_PATH` | Backup directory | `./backups` |
| `SEED_ADMIN_USERNAME` | Optional seed override | `admin` |
| `SEED_ADMIN_PASSWORD` | Optional seed override | `Admin@123` |

`packages/frontend/.env` — baked in at build time:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API origin (`http://localhost:3000` in dev, `http://localhost` behind nginx) |
| `VITE_SENTRY_DSN` | Optional error reporting |
| `VITE_APP_ENV` | `development` / `production` |

Uploaded files and backups live on the host under `monorepo-app/storage/` and are bind-mounted into
the backend container, so they survive `docker compose down`. Only `docker compose down -v` removes
the database volume.

## Commands

Run from `monorepo-app/`. A `Makefile` wraps the common ones.

| Make | npm equivalent | Does |
|---|---|---|
| `make dev` | `npm run dev --workspaces` | Backend + frontend dev servers |
| `make build` | `npm run build --workspaces` | Production build of both packages |
| `make db-push` | `npm run db:push --workspace=@app/backend` | Apply `schema.prisma` to the database |
| `make seed` | `npm run db:seed --workspace=@app/backend` | Seed departments, configs and users |
| `make migrate` | `npx prisma migrate dev` | Start/advance a migration history |
| `make docker-up` | `docker compose up -d --build` | Build and start the full stack |
| `make docker-down` | `docker compose down` | Stop the stack, keep data |
| `make docker-logs` | `docker compose logs -f` | Follow all container logs |
| `make docker-reset` | `docker compose down -v` | Stop and **delete the database volume** |

Backend quality gates: `npm run lint`, `npm run format`, `npm test`, `npm run test:coverage`
(all with `--workspace=@app/backend`).

## Project layout

```
.
├── docs/
│   ├── DEVELOPMENT_PLAN.md      # SRS, ERD, sequence diagrams, task breakdown
│   └── screenshots/
└── monorepo-app/                # npm workspaces root — the application
    ├── docker-compose.yml
    ├── Makefile
    ├── nginx/                   # reverse proxy config + cert generation
    ├── storage/                 # bind-mounted uploads and backups
    └── packages/
        ├── backend/
        │   ├── prisma/          # schema.prisma + seed.ts
        │   └── src/
        │       ├── controllers/ routes/ services/ schemas/
        │       ├── middleware/  # authenticate, authorize, access, validate
        │       ├── queues/ workers/   # BullMQ: thumbnails, backup, restore, replication
        │       └── utils/       # accessResolver, auditLog, storage, thumbnail
        └── frontend/
            └── src/
                ├── api/ components/ routes/ stores/
                └── components/{admin,dashboard,diagrams,layout,login,shared}
```

## Troubleshooting

**`docker compose up` fails on port 80 or 5432.** Something else is already bound to it. Stop the
other service, or change the published port in `docker-compose.yml`.

**Backend restarts in a loop.** Check `docker compose logs backend`. The usual cause is a
`DATABASE_URL` pointing at `localhost` instead of the `postgres` service name — inside the Compose
network the host is `postgres`, not `localhost`.

**Login returns 401 with the default password.** The database already had an `admin` user from an
earlier run; the seed does not reset passwords. Run `docker compose down -v` to start clean.

**Thumbnails never appear.** The worker needs `poppler-utils` for PDFs. It is installed in the
backend image, but must be installed manually for local development.

**Frontend builds but the API 404s.** `VITE_API_BASE_URL` is compiled into the bundle. Rebuild the
frontend after changing it (`docker compose up -d --build frontend`).

## Documentation

- [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) — full SRS, entity-relationship diagram,
  access-control resolution flow, sequence diagrams, API route map, index strategy and the original
  phased task breakdown.
- [`monorepo-app/FLOW_DIAGRAM_CREATION.md`](monorepo-app/FLOW_DIAGRAM_CREATION.md) — walkthrough of
  the diagram creation flow.
- Swagger UI at `/api/api-docs` once the backend is running.
