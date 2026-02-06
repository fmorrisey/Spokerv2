# Changelog

All notable changes to this repository are documented here.

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

These changes keep the previous defaults while enabling reuse across projects and CI by supplying alternate paths/filenames.
