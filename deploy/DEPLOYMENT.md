# Spoker v2 Production Deployment Guide

Deploy Spoker v2 to `spoker-app.rainierserver.com` via Cloudflare Tunnel with automated CI/CD.

## Architecture

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │   Cloudflare   │  ← TLS termination
              │    Tunnel      │  ← DDoS protection
              └───────┬────────┘
                      │ (no exposed ports)
                      ▼
              ┌────────────────┐
              │     Caddy      │  ← Reverse proxy
              │   (port 8080)  │
              └───────┬────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐
│    Frontend     │      │    Backend      │
│    (nginx)      │      │  (Express.js)   │
└─────────────────┘      └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  MongoDB Atlas  │
                         └─────────────────┘
```

## CI/CD Pipeline

Deployments are triggered by pushing a git tag **from a release branch**:

```bash
# Create release branch
git checkout -b release/v1.0

# ... make release preparations ...
Deploy the application to `<APP_NAME>-app.rainierserver.com` via Cloudflare Tunnel with automated CI/CD.
(The CI derives `APP_NAME` from the repository `package.json` by default.)
# Tag on release branch
git tag v1.0.0
git push origin release/v1.0 v1.0.0
```

- **Subdomain:** `<APP_NAME>-app` (derived from `package.json.project`; falls back to `package.json.name` or `spoker`)
- Tags must follow semver format: `v1.0.0`, `v2.1.3`, etc.
- Tags must be created on a `release/*` branch (e.g., `release/v1.0`)
- Tags on `main`, `develop`, or feature branches will be rejected

**Pipeline flow:**
1. GitHub Actions runs backend tests (Jest)
2. GitHub Actions runs frontend tests (Jasmine/Karma)
3. Pipeline validates tag is on a `release/*` branch
4. If tests pass, self-hosted runner on Rainier executes deployment
5. Health checks verify services are running

ALLOWED_ORIGINS=https://<APP_NAME>-app.rainierserver.com

- Docker and Docker Compose on Rainier
- Cloudflare Tunnel (`cloudflared`) configured
`./tools/scripts/deploy.sh --yes` (the script accepts `-n|--app-name` to override `APP_NAME`)
- GitHub Actions self-hosted runner

docker ps --filter "name=${APP_NAME:-spoker}"

### 1. Configure Cloudflare Tunnel

curl http://localhost:8080/api/v1/health -H "Host: ${APP_NAME:-spoker}-app.rainierserver.com"

Add public hostname:
 - App: https://${APP_NAME:-spoker}-app.rainierserver.com
 - API: https://${APP_NAME:-spoker}-app.rainierserver.com/api/v1/health
- **Service:** `http://localhost:8080`

### 2. Configure Environment

```bash
cd ~/code/spokerv2/deploy
cp .env.prod.example .env.prod
nano .env.prod
```

Required variables:
```bash
DB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
DB_NAME=ecommerce
ALLOWED_ORIGINS=https://${APP_NAME:-spoker}-app.rainierserver.com
```

### 3. Set Up Self-Hosted Runner

```bash
# Create runner directory
mkdir -p ~/code/actions-runner && cd ~/code/actions-runner

# Download and configure (get token from GitHub repo settings)
curl -o actions-runner-linux-x64-2.321.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64-2.321.0.tar.gz
./config.sh --url https://github.com/fmorrisey/Spokerv2 --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

## Manual Deployment

For manual deployments (outside CI/CD), you must be on a `release/*` branch:

```bash
cd ~/code/spokerv2
git checkout release/v1.0  # Must be on a release branch
./tools/scripts/deploy.sh
```

The script will:
- Validate you're on a `release/*` branch (or tagged commit on release branch)
- Show current git status and tag
- Prompt for confirmation
- Build and deploy containers
- Display verification steps

For non-interactive deployment:
```bash
./tools/scripts/deploy.sh --yes
```

## Verification

### Check Container Status
```bash
docker ps --filter "name=${APP_NAME:-spoker}"
```

### View Logs
```bash
# All services
docker compose -f deploy/docker-compose.prod.yml logs -f

# Specific service
docker logs ${APP_NAME:-spoker}-backend --tail 100
```

### Health Check
```bash
curl http://localhost:8080/api/v1/health -H "Host: ${APP_NAME:-spoker}-app.rainierserver.com"
```

### Test Live Site
- App: https://${APP_NAME:-spoker}-app.rainierserver.com
- API: https://${APP_NAME:-spoker}-app.rainierserver.com/api/v1/health

## Rollback

### To Previous Tag
```bash
cd ~/code/spokerv2
git fetch --tags
git checkout v0.9.0  # previous version
./tools/scripts/deploy.sh --yes
```

### Emergency Stop
```bash
docker compose -f deploy/docker-compose.prod.yml down
```

## Troubleshooting

### Containers Not Starting
```bash
docker compose -f deploy/docker-compose.prod.yml logs
```

### Cloudflare Tunnel Issues
```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
```

### Self-Hosted Runner Issues
```bash
cd ~/code/actions-runner
sudo ./svc.sh status
sudo ./svc.sh stop
sudo ./svc.sh start
```

### CORS Errors
Verify `ALLOWED_ORIGINS` in `deploy/.env.prod` matches the exact domain.

## File Reference

| File | Purpose |
|------|---------|
| `deploy/docker-compose.prod.yml` | Production container orchestration |
| `deploy/Caddyfile` | Reverse proxy configuration |
| `deploy/.env.prod` | Production secrets (git-ignored) |
| `tools/scripts/deploy.sh` | Deployment script |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
