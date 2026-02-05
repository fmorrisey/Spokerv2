# Spoker v2

Spoker v2 - refactored from the ground up using professional industry development experience. Built to enterprise software standards and architecture.

Based on the original [Spoker.io](https://github.com/fmorrisey/Spoker.io) capstone project from 2020.

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

### Production

```bash
# Configure environment
cp backend/.env.example backend/.env.prod
export MONGO_PASSWORD=your-secure-password

# Build and run
npm run build:prod
npm run docker:prod
```

**Access:** `http://localhost:3202`

---

## Architecture

| Component | Technology |
|-----------|------------|
| Frontend | Angular 17 (standalone components, Signals) |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| API Docs | OpenAPI 3.0 / Swagger |
| Proxy | nginx |

**Detailed documentation:**
- [Backend Architecture](./docs/design/technical/backend_arch.md)
- [Frontend Architecture](./docs/design/technical/frontend_arch.md)
- [Integration Architecture](./docs/design/technical/integration_arch.md)
- [Environment Configuration](./docs/ENVIRONMENT_CONFIG.md)

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

## CI/CD

GitHub Actions pipelines in `.github/workflows/`:
- **Backend**: Runs on changes to `backend/**`
- **Frontend**: Runs on changes to `frontend/**`

Both pipelines run linting, unit tests, and coverage checks.


