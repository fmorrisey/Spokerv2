# Spokerv2 Backend

[![Backend CI](https://github.com/fmorrisey/Spokerv2/actions/workflows/backend.yml/badge.svg)](https://github.com/fmorrisey/Spokerv2/actions/workflows/backend.yml)

Express.js + TypeScript API for Spoker v2. MongoDB (Mongoose) for persistence, OpenAPI 3.0 as the source of truth for types.

## Setup

```bash
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Generate two independent JWT secrets:

```bash
openssl rand -base64 32   # run twice — one for JWT_SECRET, one for JWT_REFRESH_SECRET
```

## Development

```bash
npm run dev
```

Runs the server via nodemon with hot reload.

- API: `http://localhost:5001`
- Swagger UI (dev only): `http://localhost:5001/api-docs/`

## Build

```bash
npm run build     # tsc → dist/
npm start         # run the compiled server (node dist/server.js)
```

## Testing

Jest with coverage:

```bash
npm test                              # all tests with coverage
npx jest tests/api/product.spec.ts    # a single file
```

## Seeding

Seeds sample products and a demo owner account:

```bash
npm run seed                    # seed against .env (skips if data already exists)
npm run seed -- --force         # clear existing products first, then seed
npm run seed -- --env=.env.prod # use a different env file
```

The demo owner is created from `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` (defaults
`owner@spoker.dev` / `ownerpassword`). Change the password before using in any
shared environment.

## API Types

Regenerate TypeScript types from the OpenAPI specs in `docs/*.yaml` (writes to
both `backend/src/swagger/` and `frontend/src/swagger/`):

```bash
npm run swagger:gen
```

Run this after editing any `docs/*.yaml` spec.

## Roles & Access Control

Users have a `role` of `customer` (default) or `owner`. Product reads are public;
creating, updating, and deleting products requires an authenticated **owner**
(`authenticate` + `authorize('owner')` on the route).

An account becomes an owner in one of two ways:

- **Seeded owner** — created by `npm run seed` (see above).
- **`OWNER_EMAILS` allowlist** — a comma-separated list of emails promoted to
  `owner` on register/login. The allowlist only ever promotes; it never demotes,
  so the seeded owner keeps its role even if its email isn't listed.

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default `5001`) |
| `DB_URI` | MongoDB connection string |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (required in production) |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Access / refresh token signing secrets |
| `JWT_EXPIRATION` / `JWT_REFRESH_EXPIRATION` | Token lifetimes (default `15m` / `7d`) |
| `DEMO_MODE` | `true` runs the app in session-scoped demo mode |
| `OWNER_EMAILS` | Comma-separated emails granted the `owner` role |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` / `SEED_OWNER_NAME` | Demo owner seeded by `npm run seed` |

## Architecture

Requests flow **Route → Controller → Service → Model**:

```
src/
├── routes/        # Express route definitions
├── controllers/   # Request handling, validation, response shaping
├── services/      # Business logic, database queries, error reporting
├── models/        # Mongoose schemas + constants
├── middleware/    # authenticate, authorize, sanitize, error handler, health
├── docs/          # OpenAPI YAML specs (source of truth for types)
├── swagger/       # Generated types from OpenAPI
└── scripts/       # seed.ts and other operational scripts
```

Errors are constructed via the helpers in `services/error.service.ts`
(`badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, …) and
surfaced through `middleware/errorHandler.ts`, which hands each error to
`reportError()` — the reporting boundary a dedicated error-processing
microservice is intended to take over.
