# Changelog

All notable changes to this repository are documented here.

## v0.0.6 — 2026-02-19 — Milestone 1: Auth & Demo Mode

### Added
- **JWT authentication** — `POST /api/v1/auth/register`, `login`, `refresh`, `logout`, `GET /api/v1/auth/me`
- **Refresh token** stored in httpOnly cookie (7d expiry); access token in response body (15m expiry)
- **`authenticate` middleware** — protects product `POST`/`PUT`/`DELETE` routes; reads remain public
- **User model** — Mongoose schema with bcrypt pre-save hook for password hashing
- **`sanitizeBody` middleware** — strips HTML tags from all request body fields
- **`express-mongo-sanitize`** — strips `$`/`.` from request inputs to prevent NoSQL injection
- **`cookie-parser`** — enables reading httpOnly cookies in Express
- **`/api/v1/config` endpoint** — returns `{ demoMode: boolean }` driven by `DEMO_MODE` env var
- **Frontend auth pages** — `/login` and `/register` standalone components with form validation
- **`authGuard` / `noAuthGuard`** — functional route guards; demo mode bypasses auth check
- **`AuthService`** (frontend) — manages access token in localStorage, exposes `currentUser` signal, handles token refresh on 401
- **`DemoService`** — per-session (sessionStorage) CRUD layer with 8 seed products; survives page reload, isolated per tab
- **`DemoBannerComponent`** — fixed chip (below nav) with popover: role toggle (Shop Owner / Customer), Reset Demo Data
- **Demo notice** on login page when `demoMode` is true
- **Nav demo mode UI** — hides Sign In / Register in demo mode; shows "Viewing as: Shop Owner / Customer" badge
- **`APP_INITIALIZER`** — blocks Angular bootstrap until `ConfigService.loadConfig()` resolves, guaranteeing `demoMode` signal is set before any guard runs
- **`regen-secrets.sh`** — script to regenerate `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` and/or `.env.prod`
- **Shared `_auth-form.scss` partial** — extracted from login/register components to eliminate duplication
- **Test coverage** — `auth.spec.ts` (controller + API integration), `auth.service.spec.ts`, `authenticate.spec.ts`, `config.spec.ts`, `demo.service.spec.ts`, `demo-banner.component.spec.ts`

### Changed
- Product mutations (`POST`/`PUT`/`DELETE`) now require a valid Bearer token
- `ProductService` (frontend) — all methods delegate to `DemoService` when demo mode is active
- Nav hides auth links and shows role indicator in demo mode
- `res.clearCookie` — removed `maxAge` from clear options to fix Express deprecation warning

### Fixed
- Demo banner overlapping nav register button (repositioned to `top: 5.6rem`)
- Auth guard race condition — guard now awaits `loadCurrentUser()` instead of trusting localStorage blindly

---

## v0.0.5 — 2026-02-08 — Milestone 0 Cleanup & Docker VNC

### Added
- Remote Cypress testing via Docker VNC container (`npm run cy:vnc`)
- README screenshots for dashboard, Swagger docs, and CI/CD workflows

### Changed
- README enhanced with live demo link, architecture diagram, and testing instructions

---

## 2026-02-06 — Repository restructuring and docs cleanup

- Restored `generate-types.js` in the canonical tooling path: `tools/scripts/generate-types.js`.
- Updated `swagger:gen` npm script entries to point to `tools/scripts/generate-types.js` in:
  - `package.json` (root)
  - `frontend/package.json`
  - `backend/package.json`
- Normalized deployment script references to `tools/scripts/deploy.sh` across documentation:
  - `README.md` (project structure)
  - `CLAUDE.md` (manual deploy examples)
  - `deploy/DEPLOYMENT.md` (manual deploy and file reference)
  - `docs/features/deployment_improvements.md`
- Confirmed shared dev tools are provided via submodule at `tools/shared/dev-tools` (contains `portListen.sh`, `px-to-rem.js`).
- Verified `.claude/agents` is a tracked symlink pointing to `ai/agents/claude` (keeps Claude compatibility).

Note: This is a structural/documentation-only change. No runtime application logic was modified.

## 2026-02-06 — Make scripts configurable

- `tools/scripts/generate-types.js` now accepts CLI options:
  - `-d, --docs <path>` (defaults to `backend/docs`)
  - `-b, --backend-out <path>` (defaults to `backend/src/swagger`)
  - `-f, --frontend-out <path>` (defaults to `frontend/src/swagger`)
  - `-t, --title <string>` and `-v, --version <string>` to set the temporary spec header

- `tools/scripts/deploy.sh` now accepts CLI options:
  - `-y, --yes` skip confirmation (existing)
  - `-c, --compose-file <file>` override compose file (default `deploy/docker-compose.prod.yml`)
  - `-e, --env-file <file>` env file to validate (default `deploy/.env.prod`)
  - `-b, --branch-pattern <pattern>` allowed branch prefix for deploy validation (default `release/`)


- Update: scripts now strictly prefer `package.json.project` for app/title and warn & fall back to `name` if missing.

### 2026-02-06 — Prefer `package.json.project` for app/title

- `tools/scripts/deploy.sh` and CI now prefer `package.json.project` when deriving `APP_NAME`, falling back to `package.json.name` when `project` is not present. Values are slugified (lowercase, non-alphanumerics -> `-`).
- `tools/scripts/generate-types.js` now defaults the API title from `package.json.project` (or `name`) when `--title` is not supplied.
