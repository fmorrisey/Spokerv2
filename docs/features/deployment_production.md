# LLM Implementation Guide: Cloudflare Tunnel Production Deployment (rainierserver.com)

Use this document together with the GitLab feature spec: **"Public Production Deployment via Cloudflare Tunnel."**  
You (Copilot/Claude) are implementing the repo changes needed to make the deployment real and repeatable.

## Outcome

Publish the application publicly at:

- `https://rainierserver.com` (landing page)
- `https://app.rainierserver.com` (production web app)
- `https://api.rainierserver.com` (optional / future)

**Constraints:**

- Do **not** open router ports.
- Do **not** expose the home IP in DNS.
- Cloudflare Tunnel is the only ingress.
- Use Docker Compose for production.
- Use a reverse proxy (Caddy) for hostname routing.

---

## Phase 0 — Inspect Repo (Do This First)

Before creating files, determine the repo structure:

1. **Identify whether this repo contains:**
   - Only the web app
   - Web + API
   - Web + landing
   - Monorepo / workspace setup

2. **Locate:**
   - `package.json` (and whether it's Next.js, Vite, CRA, etc.)
   - Build output target (e.g., `.next`, `dist/`)
   - Any existing Dockerfiles or compose files
   - Current static landing page source (folder path)

3. **Decide on service ports:**
   - Web app runtime port (prefer `3000`)
   - API runtime port (prefer `5000`)
   - Reverse proxy internal listening port (use `8080`)

**Do not guess. Infer from repo contents.**

---

## Phase 1 — Add Deployment Folder

Create a `deploy/` directory with:

- `deploy/docker-compose.prod.yml`
- `deploy/Caddyfile`
- `deploy/.env.prod.example`
- `deploy/DEPLOYMENT.md`

Also update root `.gitignore` to exclude:

- `deploy/.env.prod`
- any secret material

---

## Phase 2 — Containerize the Web App (Production)

### If a Dockerfile already exists

Review it for production readiness:
- Multi-stage build recommended
- `NODE_ENV=production`
- Predictable port
- Non-root user if easy
- Add a simple healthcheck if feasible

### If no Dockerfile exists

Create a production Dockerfile appropriate to the framework.

#### If Next.js

- Use multi-stage build: deps → build → runtime
- Runtime runs `next start`
- Expose port `3000`

#### If Vite/React static

Two options:
- **Option A (preferred):** build static assets and serve via Caddy as static files
- **Option B:** build static assets and serve via a tiny Node static server

Prefer A unless the app is explicitly SSR.

#### If Angular

- Build into `dist/`
- Serve static via Caddy (preferred)

**Requirement:** web app must be reachable internally at `http://web:<PORT>` from Caddy.

---

## Phase 3 — Add Reverse Proxy Configuration (Caddy)

Create `deploy/Caddyfile` that:

- listens on `:8080`
- routes by hostname
- serves landing page from disk
- reverse proxies `app.rainierserver.com` to the web container
- optionally reverse proxies `api.rainierserver.com` to an API container

### Caddyfile Template

Use this exact structure and modify only paths/ports as required:

```caddyfile
{
  auto_https off
}

:8080 {
  respond "Not Found" 404
}

rainierserver.com:8080 {
  root * /srv/landing
  file_server
}

app.rainierserver.com:8080 {
  reverse_proxy web:3000
}

api.rainierserver.com:8080 {
  reverse_proxy api:5000
}
```

**Notes:**

- Keep `auto_https off` because TLS is terminated at Cloudflare.
- Websockets should work automatically with `reverse_proxy`.
- If the landing page path is different, update `/srv/landing` mount accordingly.

---

## Phase 4 — Add Production Docker Compose

Create `deploy/docker-compose.prod.yml`.

**Requirements:**

- `caddy` service listens on host port `8080` (internal only)
- `web` service is not exposed publicly; use `expose` not `ports`
- Use `restart: unless-stopped`
- Include landing mount into Caddy
- Keep networking default unless there's a reason to change

### Compose Template

Start from this and adjust build contexts and ports:

```yaml
services:
  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports:
      - "8080:8080"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./landing:/srv/landing:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - web

  web:
    build:
      context: ..
      dockerfile: Dockerfile
    container_name: web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    expose:
      - "3000"

volumes:
  caddy_data:
  caddy_config:
```

**If there is an API:**

- Add `api` service
- Add `depends_on: - api`
- Add `expose: "5000"`

**If landing isn't in `deploy/landing`:**

- Update the mount to the real landing folder
- Or copy landing build output into `deploy/landing` via documented build step

---

## Phase 5 — Environment Variables

Create `deploy/.env.prod.example` containing placeholders only.

**Rules:**

- Do not commit secrets.
- Do not hardcode tokens in compose.
- Prefer an `env_file` reference per service if needed.

**Example:**

```bash
# Web
WEB_PUBLIC_BASE_URL=https://app.rainierserver.com

# API (optional)
API_BASE_URL=https://api.rainierserver.com
API_SECRET=replace_me

# Any third-party keys
SOME_KEY=replace_me
```

**If the app expects `.env` at repo root:**

- Document how production env is injected at runtime
- Do not alter development flow unnecessarily

---

## Phase 6 — Deployment Documentation

Create `deploy/DEPLOYMENT.md` that includes:

### 1. One-time Cloudflare setup (no secrets)

Explain in concrete steps:

- In **Cloudflare Zero Trust → Tunnels** → select existing tunnel
- **Add Public Hostnames:**
  - `rainierserver.com` → `http://localhost:8080`
  - `app.rainierserver.com` → `http://localhost:8080`
  - `api.rainierserver.com` → `http://localhost:8080` (optional)

**State explicitly:**

- Do not create A/AAAA records pointing at home IP
- No router port forwarding

### 2. Build and run on Rainier

Include exact commands:

```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
docker logs caddy --tail 200
docker ps
```

### 3. Rollback

**If building locally:**

```bash
git checkout <previous>
# rebuild + restart
```

**If using registry later:**

- Pin image tag and redeploy

### 4. Basic verification checklist

- [ ] landing loads
- [ ] app loads
- [ ] API responds (optional)
- [ ] containers healthy

---

## Phase 7 — Optional Hardening (Leave as "Nice To Have")

Do not block the feature on these, but document them:

- Cloudflare WAF / rate limiting
- Cloudflare Access for staging or admin routes
- Healthcheck endpoints
- Logging strategy

---

## Implementation Quality Bar

- Keep changes minimal and maintainable.
- Prefer adding `deploy/` configs rather than rewriting existing dev tooling.
- Do not break local development workflows.
- Keep everything documented in Markdown.
- No secrets in git history.

---

## Final Deliverable Checklist (Repo)

- [ ] `deploy/docker-compose.prod.yml`
- [ ] `deploy/Caddyfile`
- [ ] `deploy/.env.prod.example`
- [ ] `deploy/DEPLOYMENT.md`
- [ ] Updated `.gitignore` for prod env file
- [ ] Dockerfile(s) added/updated as needed
- [ ] Works with: `docker compose -f deploy/docker-compose.prod.yml up -d --build`

---

**End.**
