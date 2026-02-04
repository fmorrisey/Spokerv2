# Spoker V2 Integration Architecture

- [Backend Architecture](backend_arch.md)
- [Frontend Architecture](frontend_arch.md)

## Full Stack Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                   nginx (Production)                     │
│         Routes /api/* → Backend, /* → Frontend          │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│      Frontend       │       │       Backend       │
│    Angular 17       │       │   Express + TS      │
│    Port 4200        │       │    Port 5001        │
└─────────────────────┘       └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │      MongoDB        │
                              │    Port 27017       │
                              └─────────────────────┘
```

## Type-Safe Contract

OpenAPI specs (`backend/docs/*.yaml`) are the single source of truth:

1. Backend defines endpoints in YAML
2. `npm run swagger:gen` generates TypeScript types
3. Both backend and frontend use generated types
4. Compile-time errors catch API contract mismatches

## Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Frontend Unit | Jasmine/Karma | Components, Services |
| Backend Unit | Jest | Controllers, Services |
| Frontend E2E | Cypress | User workflows |
| Backend E2E | Cypress | API contracts |
| Integration | Docker Compose | Full stack |

### Running Tests
```bash
npm run test              # All unit tests
npm run test:backend      # Backend only
npm run test:frontend     # Frontend only
```

## Docker Compose Environments

### Development (`docker-compose.dev.yml`)
- Hot reload enabled
- Source mounted as volumes
- Swagger docs available

### Production (`docker-compose.prod.yml`)
- Optimized builds
- nginx reverse proxy
- MongoDB authentication
- Security headers enabled
