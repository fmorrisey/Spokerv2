# Spoker v2

[![Backend CI](https://github.com/fmorrisey/Spokerv2/actions/workflows/backend.yml/badge.svg)](https://github.com/fmorrisey/Spokerv2/actions/workflows/backend.yml)
[![Frontend CI](https://github.com/fmorrisey/Spokerv2/actions/workflows/frontend.yml/badge.svg)](https://github.com/fmorrisey/Spokerv2/actions/workflows/frontend.yml)
[![Deploy](https://github.com/fmorrisey/Spokerv2/actions/workflows/deploy.yml/badge.svg)](https://github.com/fmorrisey/Spokerv2/actions/workflows/deploy.yml)

Spoker is a full-stack e-commerce product catalog built with Angular 17 and Express.js, demonstrating enterprise-grade architecture from API design to production deployment. The entire stack — CI/CD pipeline, reverse proxy, and application containers — runs on self-hosted infrastructure with zero exposed ports via Cloudflare Tunnel.

Refactored from the ground up based on the original [Spoker.io](https://github.com/fmorrisey/Spoker.io) capstone project (2020).

<img width="1592" height="1120" alt="Screenshot 2026-02-08 at 21 23 53" src="https://github.com/user-attachments/assets/5c804b46-3d3b-44c3-9f8e-725711cb3ef1" />

### Key Features

- **Type-safe API contracts** — OpenAPI 3.0 specs generate TypeScript types shared across frontend and backend
- **Modern Angular** — Standalone components with Angular Signals for reactive state (no RxJS boilerplate)
- **Production CI/CD** — GitHub Actions pipeline with automated tests, release branch gating, and post-deploy health checks
- **Self-hosted infrastructure** — Docker containers behind Caddy reverse proxy, accessed via Cloudflare Tunnel with zero exposed ports
- **Self-hosted GitHub Actions runner** — Deploys to private infrastructure without exposing secrets
- **Remote Cypress Testing** - Standalone docker container to host cypress testing when running on a headless system

## 🌐 Live Demo

**Production:** [https://spoker-app.rainierserver.com](https://spoker-app.rainierserver.com)

## Roadmap

| Milestone | Status |
|-----------|--------|
| M0 — First Impressions (CRUD, seed data, docs) | ✅ Complete |
| M1 — Authentication & User Management | ✅ Complete |
| M2 — Shopping Cart & Wishlist | 📋 Planned |
| M3 — Checkout & Orders (Stripe integration) | 📋 Planned |
| M4 — Admin Dashboard & RBAC | 📋 Planned |
| M5 — Polish & Observability | 📋 Planned |

See the full [project board](https://github.com/users/fmorrisey/projects/1) for detailed progress.

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- MongoDB (or use Docker)

### Development

**Docker (recommended):**
```bash
npm run build:dev     # Build dev containers
npm run docker:dev    # Run with hot reload
```

**Local:**
```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm start
```

**Access:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5001`
- Swagger: `http://localhost:5001/api-docs/`

### Environment Setup

Copy the example env file and fill in your values:
```bash
cp backend/.env.example backend/.env
```

**JWT secrets** — generate two independent secrets (one for access tokens, one for refresh tokens):
```bash
openssl rand -base64 32  # run twice, use each output for JWT_SECRET and JWT_REFRESH_SECRET
```

Then set them in `backend/.env`:
```
JWT_SECRET=<generated secret>
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=<generated secret>
JWT_REFRESH_EXPIRATION=7d
```

Access tokens expire in 15 minutes. Refresh tokens (stored in an httpOnly cookie) expire in 7 days and are used to issue new access tokens without re-login.

### Swagger API Docs support

<img width="1486" height="1269" alt="Screenshot 2026-02-08 at 21 29 34" src="https://github.com/user-attachments/assets/9960c533-1a9b-41e8-af13-cd7b21c22ab8" />


---

## Architecture

| Component | Technology |
|-----------|------------|
| Frontend | Angular 17 (standalone components, Signals) |
| Backend | Express.js + TypeScript |
| Database | MongoDB Atlas |
| API Docs | OpenAPI 3.0 / Swagger |
| Proxy | Caddy (production) / nginx (development) |
| Infrastructure | Docker, Cloudflare Tunnel |

**Detailed documentation:**
- [Backend Architecture](./docs/design/technical/backend_arch.md)
- [Frontend Architecture](./docs/design/technical/frontend_arch.md)
- [Integration Architecture](./docs/design/technical/integration_arch.md)
- [Deployment Guide](./deploy/DEPLOYMENT.md)

---

## 🚀 Deployment Infrastructure

### Production Architecture

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │   Cloudflare   │  ← TLS termination, DDoS protection
              │    Tunnel      │
              └───────┬────────┘
                      │ (encrypted tunnel, no open ports)
                      ▼
              ┌────────────────┐
              │     Caddy      │  ← Reverse proxy, hostname routing
              │   (port 8080)  │
              └───────┬────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │    Backend      │
│  (Angular/nginx)│      │  (Express.js)   │
│    port 80      │      │   port 5001     │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  MongoDB Atlas  │
                         └─────────────────┘
```

### CI/CD Pipeline

```
Push tag (v1.0.0)
       │
       ▼
┌──────────────────────────────────────────┐
│           GitHub Actions                  │
│  ┌─────────────┐    ┌─────────────────┐  │
│  │   Backend   │    │    Frontend     │  │
│  │   Tests     │    │     Tests       │  │
│  │  (Jest)     │    │ (Jasmine/Karma) │  │
│  └──────┬──────┘    └────────┬────────┘  │
│         └──────────┬─────────┘           │
│                    ▼                     │
│         ┌─────────────────────┐          │
│         │  Self-Hosted Runner │          │
│         │     (on Server)     │          │
│         │  ┌───────────────┐  │          │
│         │  │ deploy.sh     │  │          │
│         │  │ docker compose│  │          │
│         │  │ health checks │  │          │
│         │  └───────────────┘  │          │
│         └─────────────────────┘          │
└──────────────────────────────────────────┘
```

### Deploy a Release

> **Important:** The deploy pipeline only runs when a version tag is pushed from a `release/*` branch. Tags pushed from `main` or any other branch will pass tests but skip deployment.

```bash
# 1. Create a release branch from main
git checkout main && git pull
git checkout -b release/v1.0

# 2. Bump versions in package.json files (root, backend, frontend) to match tag
npm version 1.0.0 --no-git-tag-version
npm version 1.0.0 --no-git-tag-version --prefix=backend
npm version 1.0.0 --no-git-tag-version --prefix=frontend

# 3. Commit the version bump
git add package.json backend/package.json frontend/package.json
git commit -m "chore: bump version to 1.0.0"

# 4. Tag the release commit and push both
git tag v1.0.0
git push origin release/v1.0 v1.0.0
```

This triggers:
1. ✅ Backend tests (GitHub-hosted runner)
2. ✅ Frontend tests (GitHub-hosted runner)
3. ✅ Deploy to production (self-hosted runner on private network)
4. ✅ Health checks and verification

**If deployment was skipped** (tag pushed from wrong branch):
```bash
# Delete the tag locally and remotely, re-tag from release branch
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git checkout release/v1.0
git tag v1.0.0
git push origin v1.0.0
```

### Key Features

- **Zero exposed ports** — Cloudflare Tunnel provides secure ingress
- **Self-hosted runner** — Deploys to private infrastructure without exposing secrets
- **Automated testing** — All tests must pass before deployment
- **Health checks** — Verifies services are running post-deploy
- **Tag-based releases** — Semantic versioning triggers deployments

---

## Testing

### All Tests
```bash
npm run test           # Backend + Frontend
npm run test:backend   # Backend only
npm run test:frontend  # Frontend only
```

### Backend (Jest)
```bash
cd backend
npm test                           # All tests with coverage
npx jest tests/api/product.spec.ts # Single file
```

### Frontend (Jasmine/Karma)
```bash
cd frontend
npm test                                    # All tests with coverage
ng test --include=**/product.service.spec.ts # Single file
```

### E2E (Cypress)
```bash
cd frontend && npm run cy:dev     # Interactive mode (starts dev server + Cypress)
cd frontend && npm run cy:run     # Headless mode
cd frontend && npm run cy:vnc     # Launch VNC workflow when developing on headless systems
```
<img width="1735" height="953" alt="Screenshot 2026-02-08 at 17 40 31" src="https://github.com/user-attachments/assets/c14a72f5-71e2-43d6-8c75-29647441d1f2" />
In VNC mode: Cypress can be accessed via the browser at: http://localhost:6080/vnc.html


---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `backend.yml` | Push to `backend/**` | Run backend tests |
| `frontend.yml` | Push to `frontend/**` | Run frontend tests |
| `deploy.yml` | Push tag `v*.*.*` on a `release/*` branch | Deploy to production |

<img width="1714" height="795" alt="Screenshot 2026-02-08 at 21 33 27" src="https://github.com/user-attachments/assets/e0cdc602-b74d-405b-8b4e-b07d4b58b871" />

---


## Project Structure

```
spokerv2/
├── backend/           # Express.js API
├── frontend/          # Angular 17 app
├── deploy/            # Production deployment configs
│   ├── Caddyfile
│   ├── docker-compose.prod.yml
│   └── DEPLOYMENT.md
├── tools/             # Canonical tooling root
│   ├── scripts/       # Project-specific glue scripts
│   │   └── deploy.sh  # Deployment script
│   └── shared/        # Reusable cross-project utilities (submodule)
├── nginx/             # Development proxy
└── .github/workflows/ # CI/CD pipelines
```

---

## License

Copyright (c) 2026 Forrest Morrisey. All Rights Reserved. See [LICENSE](./LICENSE) for details.
