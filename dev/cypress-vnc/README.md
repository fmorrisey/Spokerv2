# Cypress + noVNC (Headless Server)

Run Cypress interactively on a headless server via a browser-based VNC desktop.

## Start

From the frontend directory:

```bash
npm run cy:vnc
```

Or manually from the repo root:

```bash
cd dev/cypress-vnc
docker compose -f docker-compose.cypress.yml up --build -d
```

## Access the Desktop

Open a browser to:

```
http://<server-ip>:6080
```

## Run Cypress

Open a shell in the running container:

```bash
docker exec -it cypress-vnc bash
```

Then start Cypress:

```bash
npx cypress open --e2e
```

The repo is mounted at `/e2e`, so Cypress runs against the same code you're editing on the host.

## Stop

```bash
docker compose -f dev/cypress-vnc/docker-compose.cypress.yml down
```

## Notes

- The dev server must be running on the host (`npm start` in `frontend/`) before launching Cypress tests.
- The container reaches the host dev server via `host.docker.internal:4200` (configured automatically via `CYPRESS_BASE_URL`).
- On first run, `npm ci` installs frontend dependencies inside the container. Subsequent runs skip this if `node_modules/` already exists (it's persisted via the volume mount).
- VNC packages are baked into the Docker image, so container startup is fast after the initial build.
