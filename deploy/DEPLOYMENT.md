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

# Tag on release branch
git tag v1.0.0
git push origin release/v1.0 v1.0.0
```

**Requirements:**
- Tags must follow semver format: `v1.0.0`, `v2.1.3`, etc.
- Tags must be created on a `release/*` branch (e.g., `release/v1.0`)
- Tags on `main`, `develop`, or feature branches will be rejected

**Pipeline flow:**
1. GitHub Actions runs backend tests (Jest)
2. GitHub Actions runs frontend tests (Jasmine/Karma)
3. Pipeline validates tag is on a `release/*` branch
4. If tests pass, self-hosted runner on Rainier executes deployment
5. Health checks verify services are running

## Prerequisites

- Docker and Docker Compose on Rainier
- Cloudflare Tunnel (`cloudflared`) configured
- MongoDB Atlas cluster
- GitHub Actions self-hosted runner

## Initial Setup

### 1. Configure Cloudflare Tunnel

In **Cloudflare Zero Trust** → **Networks** → **Tunnels**:

Add public hostname:
- **Subdomain:** `spoker-app`
- **Domain:** `rainierserver.com`
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
ALLOWED_ORIGINS=https://spoker-app.rainierserver.com
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
./scripts/deploy.sh
```

The script will:
- Validate you're on a `release/*` branch (or tagged commit on release branch)
- Show current git status and tag
- Prompt for confirmation
- Build and deploy containers
- Display verification steps

For non-interactive deployment:
```bash
./scripts/deploy.sh --yes
```

## Verification

### Check Container Status
```bash
docker ps --filter "name=spoker"
```

### View Logs
```bash
# All services
docker compose -f deploy/docker-compose.prod.yml logs -f

# Specific service
docker logs spoker-backend --tail 100
```

### Health Check
```bash
curl http://localhost:8080/api/v1/health -H "Host: spoker-app.rainierserver.com"
```

### Test Live Site
- App: https://spoker-app.rainierserver.com
- API: https://spoker-app.rainierserver.com/api/v1/health

## Rollback

Rollback procedures for reverting to a previous version.

### Quick Rollback to Previous Tag

If you need to quickly rollback to a previous version:

```bash
cd ~/code/spokerv2
git fetch --tags

# List available tags
git tag -l

# Checkout previous version
git checkout v0.9.0  # Replace with your target version

# Deploy
./scripts/deploy.sh --yes
```

### Rollback via CI/CD

To rollback using the automated pipeline:

```bash
# On your local machine
git fetch --tags
git checkout <previous-tag>  # e.g., v0.9.0

# Verify tag is on a release branch
git branch -r --contains $(git rev-parse HEAD) | grep origin/release/

# Push tag (CI/CD will deploy it)
git push origin <previous-tag>
```

### Image Retention Strategy

Docker images are automatically pruned after successful deployments to save disk space. To keep images for rollback:

```bash
# List current images
docker images | grep spoker

# Tag a specific version for retention (prevents pruning)
docker tag spoker-backend:latest spoker-backend:v1.0.0-keep
docker tag spoker-frontend:latest spoker-frontend:v1.0.0-keep

# To rollback to a retained image
docker tag spoker-backend:v1.0.0-keep spoker-backend:latest
docker compose -f deploy/docker-compose.prod.yml up -d
```

**Recommendation:** Keep the last 2-3 production images tagged with `-keep` suffix for quick rollback without rebuilding.

### Rollback Checklist

Before rolling back, verify:
- [ ] Database schema is compatible with the previous version
- [ ] No irreversible data migrations were run
- [ ] External services (MongoDB Atlas, etc.) are compatible

After rollback, verify:
- [ ] All containers are running: `docker ps --filter "name=spoker"`
- [ ] Health check passes: `curl http://localhost:8080/api/v1/health -H "Host: spoker-app.rainierserver.com"`
- [ ] App is accessible: https://spoker-app.rainierserver.com

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
| `scripts/deploy.sh` | Deployment script |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
