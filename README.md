# Spoker v2

Spoker v2 - refactored from the ground up using professional industry development experience. Built to enterprise software standards and architecture.

Based on the original [Spoker.io](https://github.com/fmorrisey/Spoker.io) capstone project from 2020.

## 🌐 Live Demo

**Production:** [https://spoker-app.rainierserver.com](https://spoker-app.rainierserver.com)

Deployed on a self-hosted homelab server via Cloudflare Tunnel — zero exposed ports, enterprise-grade security.

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
│         │    (on Rainier)     │          │
│         │  ┌───────────────┐  │          │
│         │  │ deploy.sh     │  │          │
│         │  │ docker compose│  │          │
│         │  │ health checks │  │          │
│         │  └───────────────┘  │          │
│         └─────────────────────┘          │
└──────────────────────────────────────────┘
```

### Deploy a Release

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This triggers:
1. ✅ Backend tests (GitHub-hosted runner)
2. ✅ Frontend tests (GitHub-hosted runner)
3. ✅ Deploy to production (self-hosted runner on private network)
4. ✅ Health checks and verification

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
cd frontend && npx cypress open   # Frontend E2E
cd backend && npx cypress open    # API E2E
```

---

## CI/CD Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `backend.yml` | Push to `backend/**` | Run backend tests |
| `frontend.yml` | Push to `frontend/**` | Run frontend tests |
| `deploy.yml` | Push tag `v*.*.*` | Deploy to production |

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

MIT
