# Tools - scripts

This folder contains project glue scripts. They are intentionally generic and accept CLI options so they can be reused across projects.

## `generate-types.js`
Generate TypeScript types from OpenAPI YAML specs.

Usage:

```bash
# Defaults: reads backend/docs and writes to backend/src/swagger and frontend/src/swagger
node tools/scripts/generate-types.js

# Custom paths
node tools/scripts/generate-types.js \
  --docs backend/docs \
  --backend-out backend/src/swagger \
  --frontend-out frontend/src/swagger

# Set temp spec header
node tools/scripts/generate-types.js --title "My API" --version "2.0.0"
```

Run `node tools/scripts/generate-types.js --help` for full options.

## `deploy.sh`
Deployment helper that validates branch/tag and runs Docker Compose.
Defaults assume production compose file at `deploy/docker-compose.prod.yml` and env at `deploy/.env.prod`.

Usage:

```bash
# Interactive
./tools/scripts/deploy.sh

# Non-interactive
./tools/scripts/deploy.sh --yes

# Custom compose or env file
./tools/scripts/deploy.sh -c deploy/docker-compose.prod.yml -e deploy/.env.prod

# Change allowed branch prefix (default: release/)
./tools/scripts/deploy.sh -b release/
```

Run `./tools/scripts/deploy.sh --help` for full options.