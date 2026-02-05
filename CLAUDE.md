# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spoker v2 is a full-stack product management application with an Express/TypeScript backend and Angular 17 frontend. Uses MongoDB for data persistence and OpenAPI for type-safe API contracts.

## Instructions to Claude
Claude is not allowed to be a co-author on this project

## Commands

### Development
```bash
npm run build:dev          # Build and start dev environment (Docker)
npm run docker:dev         # Start dev environment (frontend: 4200, backend: 5001)
```

### Testing
```bash
# All tests
npm run test               # Run backend + frontend tests

# Backend (from /backend or root)
npm run test:backend                    # Run all backend tests
npm run test:unit --prefix=backend      # Jest unit tests with coverage

# Frontend (from /frontend or root)
npm run test:frontend                   # Run all frontend tests
npm test --prefix=frontend              # Jasmine/Karma unit tests

# Single test file
cd backend && npx jest tests/api/product.spec.ts
cd frontend && ng test --include=**/product.service.spec.ts
```

### Code Generation
```bash
npm run swagger:gen        # Generate TypeScript types from OpenAPI specs
```

After modifying `backend/docs/*.yaml`, run swagger:gen to update types in both `backend/src/swagger/` and `frontend/src/swagger/`.

## Architecture

### Backend (Express + TypeScript)
```
backend/src/
├── routes/        # Express route definitions
├── controllers/   # Request handling, validation
├── services/      # Business logic, database queries
├── models/        # Mongoose schemas
├── docs/          # OpenAPI YAML specs (source of truth for types)
└── swagger/       # Generated types from OpenAPI
```

**Pattern**: Route → Controller → Service → Model

### Frontend (Angular 17 Standalone)
```
frontend/src/app/
├── components/    # Standalone Angular components
├── services/      # Injectable services with Angular Signals for state
└── swagger/       # Generated API types
```

**Key patterns**:
- Standalone components (no NgModules)
- Angular Signals for reactive state (`signal<T>()`)
- `openapi-fetch` client with generated types for type-safe API calls

### API Client Setup
The frontend uses a typed API client configured in `services/apiClient/api-client.service.ts`. Services inject this to make typed requests:
```typescript
const client = createClient<ApiPaths>({ baseUrl });
const { data } = await client.GET('/api/v1/products');
```

## Adding a New API Endpoint

1. Define spec in `backend/docs/[feature].yaml`
2. Create service in `backend/src/services/`
3. Create controller in `backend/src/controllers/`
4. Add route in `backend/src/routes/`, register in `app.ts`
5. Run `npm run swagger:gen`
6. Create frontend service in `frontend/src/app/services/`

## Ports
- Frontend dev: `localhost:4200`
- Backend dev: `localhost:5001`
- Swagger docs: `localhost:5001/api-docs/` (dev only)
- Production: `localhost:8080` (Caddy) → Cloudflare Tunnel

## Deployment

**Production URL:** https://spoker-app.rainierserver.com

**Requirement:** Deployments only allowed from `release/*` branches.

### Deploy via CI/CD (recommended)
```bash
git checkout -b release/v1.0    # Create release branch
git tag v1.0.0                   # Tag on release branch
git push origin release/v1.0 v1.0.0
```
Triggers GitHub Actions → tests → validates release branch → deploys to Rainier.

### Manual Deploy
```bash
git checkout release/v1.0        # Must be on a release branch
./scripts/deploy.sh              # Interactive with confirmation
./scripts/deploy.sh --yes        # Non-interactive (CI/CD mode)
```

### Key Files
- `deploy/docker-compose.prod.yml` - Production orchestration
- `deploy/Caddyfile` - Reverse proxy config
- `deploy/.env.prod` - Production secrets (git-ignored)
- `.github/workflows/deploy.yml` - CI/CD pipeline
