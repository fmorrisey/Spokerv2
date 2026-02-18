# Demo Mode

## Overview

Demo mode provides a sandboxed version of Spoker v2 that runs in both dev and prod. In dev it gives a clean mock dataset to work against; in prod it serves as a public-facing demo where anyone can explore the app, create/edit/delete products, and toggle between shop owner and customer perspectives.

Activated by a single environment variable: `DEMO_MODE=true`. No code changes between environments.

---

## User-Facing Behavior

- A fixed **"DEMO MODE"** badge appears top-right of the viewport
- Hovering or clicking opens a popover explaining:
  - *"You're exploring a live demo. Feel free to create, edit, and delete — data may reset at any time."*
  - A **Shop Owner / Customer** role toggle for switching perspectives
- Data is shared (not per-session) and can be reset manually by an admin

---

## Architecture

### Env Vars

| Variable | Description |
|---|---|
| `DEMO_MODE` | `true` to activate demo mode |
| `DB_URI_DEMO` | MongoDB URI for the dedicated demo database |

### Backend

- `connectDB()` branches on `DEMO_MODE` to connect to `DB_URI_DEMO`
- On startup in demo mode, `Product.seed()` is called (no-op if data exists)
- `GET /api/v1/config` → `{ demoMode: boolean }` — lets the frontend know
- `POST /api/v1/demo/reset` → clears and re-seeds demo DB (returns 403 if not in demo mode)

### Frontend

- `ConfigService.loadConfig()` fetches `/api/v1/config` on app init, sets `demoMode` signal
- `DemoService` manages `demoRole` signal (`'owner' | 'customer'`) and `resetDemoData()`
- `DemoBannerComponent` renders conditionally based on `demoMode` signal

---

## Implementation Checklist

### Backend
- [ ] Add `DEMO_MODE`, `DB_URI_DEMO` to `backend/.env.example` and `backend/src/models/constants.ts`
- [ ] Update `backend/src/config/mongodb.ts` — demo DB branch + auto-seed on startup
- [ ] Create `backend/docs/config.yaml` (OpenAPI spec for `/api/v1/config`)
- [ ] Create `backend/docs/demo.yaml` (OpenAPI spec for `/api/v1/demo/reset`)
- [ ] Create `backend/src/services/config.service.ts`
- [ ] Create `backend/src/controllers/config.controller.ts`
- [ ] Create `backend/src/services/demo.service.ts`
- [ ] Create `backend/src/controllers/demo.controller.ts`
- [ ] Create `backend/src/routes/config.route.ts`
- [ ] Create `backend/src/routes/demo.route.ts`
- [ ] Register new routes in `backend/src/app.ts`
- [ ] Run `npm run swagger:gen`

### Frontend
- [ ] Extend `frontend/src/app/services/config.service.ts` — add `demoMode` signal + `loadConfig()`
- [ ] Create `frontend/src/app/services/demo/demo.service.ts`
- [ ] Create `frontend/src/app/components/demo-banner/` (`.ts`, `.html`, `.scss`)
- [ ] Update `frontend/src/app/app.component.ts` — call `loadConfig()` on init, import banner
- [ ] Update `frontend/src/app/app.component.html` — add `<demo-banner />`

### Tests
- [ ] `backend/tests/api/config.spec.ts`
- [ ] `backend/tests/api/demo.spec.ts`
- [ ] `backend/tests/services/demo.service.spec.ts`
- [ ] `frontend/src/app/services/demo/demo.service.spec.ts`
- [ ] `frontend/src/app/components/demo-banner/demo-banner.component.spec.ts`

---

## Key Design Decisions

- **Single mongoose connection** — `connectDB` swaps the URI; all models use the default connection, no multi-connection complexity
- **Controller-level guard** on reset endpoint — returns 403 if `DEMO_MODE=false`, simple and testable
- **`ngOnInit` not `APP_INITIALIZER`** for `loadConfig()` — avoids blocking Angular bootstrap if backend is slow; banner renders once the signal updates
- **Banner at AppComponent root** — global, viewport-fixed; not tied to any feature screen
- **No per-session isolation (yet)** — demo DB is shared; per-session sandboxing is a future enhancement

---

## Verification

```bash
# 1. Set DEMO_MODE=true + DB_URI_DEMO in backend/.env, start dev stack
npm run docker:dev

# 2. Verify demo DB auto-seeded — check logs for "[DEMO]" connection message

# 3. Test config endpoint
curl http://localhost:5001/api/v1/config
# → { "demoMode": true }

# 4. Test reset endpoint
curl -X POST http://localhost:5001/api/v1/demo/reset
# → { "message": "Demo data reset successfully" }

# 5. Open http://localhost:4200 — verify orange DEMO MODE badge top-right
# 6. Hover/click badge — verify popover with description + role toggle

# 7. Run all tests
npm run test
```
