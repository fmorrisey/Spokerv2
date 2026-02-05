# Spoker v2 Production Deployment Guide

Deploy Spoker v2 to `spoker-app.rainierserver.com` via Cloudflare Tunnel.

## Architecture

```
Internet
    │
    ▼
Cloudflare (TLS termination)
    │
    ▼ (Cloudflare Tunnel)
localhost:8080
    │
    ▼
┌─────────────────────────────────────┐
│           Caddy (port 8080)          │
│  ┌─────────────┬─────────────────┐  │
│  │   /api/*    │    /* (other)   │  │
│  └──────┬──────┴────────┬────────┘  │
└─────────┼───────────────┼───────────┘
          ▼               ▼
    ┌──────────┐    ┌──────────┐
    │ Backend  │    │ Frontend │
    │ :5001    │    │ :80      │
    └──────────┘    └──────────┘
          │
          ▼
    MongoDB Atlas
```

## Prerequisites

- Docker and Docker Compose installed on Rainier server
- Cloudflare Tunnel (`cloudflared`) installed and authenticated
- MongoDB Atlas cluster with connection string
- Access to Cloudflare Zero Trust dashboard

## One-Time Setup

### 1. Clone Repository on Rainier

```bash
cd /opt
git clone https://github.com/fmorrisey/Spokerv2.git spokerv2
cd spokerv2
```

### 2. Configure Environment

```bash
cd deploy
cp .env.prod.example .env.prod
nano .env.prod
```

Fill in your MongoDB Atlas connection string and verify ALLOWED_ORIGINS.

### 3. Configure Cloudflare Tunnel

In **Cloudflare Zero Trust Dashboard** → **Networks** → **Tunnels**:

1. Select your existing tunnel (or create one)
2. Go to **Public Hostname** tab
3. Click **Add a public hostname**
4. Configure:
   - **Subdomain**: `spoker-app`
   - **Domain**: `rainierserver.com`
   - **Type**: `HTTP`
   - **URL**: `localhost:8080`
5. Save

**Important:**
- Do NOT create A/AAAA DNS records pointing to your home IP
- Do NOT open router ports
- Cloudflare Tunnel is the only ingress

## Build and Deploy

### First Deployment

```bash
cd /opt/spokerv2
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

### Check Status

```bash
# View running containers
docker ps

# Check logs
docker logs spoker-caddy --tail 100
docker logs spoker-frontend --tail 100
docker logs spoker-backend --tail 100

# Check backend health
curl -s http://localhost:8080/api/v1/health -H "Host: spoker-app.rainierserver.com"
```

### Update Deployment

```bash
cd /opt/spokerv2
git pull
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

### Stop Services

```bash
docker compose -f deploy/docker-compose.prod.yml down
```

## Verification Checklist

After deployment, verify:

- [ ] `docker ps` shows 3 healthy containers (caddy, frontend, backend)
- [ ] `curl http://localhost:8080` returns "Not Found" (no hostname)
- [ ] `curl http://localhost:8080 -H "Host: spoker-app.rainierserver.com"` returns HTML
- [ ] `curl http://localhost:8080/api/v1/health -H "Host: spoker-app.rainierserver.com"` returns JSON
- [ ] `https://spoker-app.rainierserver.com` loads in browser
- [ ] `https://spoker-app.rainierserver.com/api/v1/health` returns health status
- [ ] Products load on the dashboard

## Rollback

### Quick Rollback (Previous Git Commit)

```bash
cd /opt/spokerv2
git log --oneline -5  # Find previous working commit
git checkout <commit-hash>
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

### Full Rollback (Clean Rebuild)

```bash
docker compose -f deploy/docker-compose.prod.yml down
docker system prune -f
git checkout main
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs spoker-backend

# Common issues:
# - Invalid DB_URI in .env.prod
# - Port conflict (another service on 8080)
```

### 502 Bad Gateway

```bash
# Check if backend is healthy
docker logs spoker-backend --tail 50

# Check Caddy can reach backend
docker exec spoker-caddy wget -qO- http://backend:5001/api/v1/health
```

### CORS Errors

Verify `ALLOWED_ORIGINS` in `.env.prod` matches exactly:
```
ALLOWED_ORIGINS=https://spoker-app.rainierserver.com
```

### Cloudflare Tunnel Not Connecting

```bash
# Check tunnel status
cloudflared tunnel list
cloudflared tunnel info <tunnel-name>

# Restart tunnel
sudo systemctl restart cloudflared
```

## Maintenance

### View Logs

```bash
# All services
docker compose -f deploy/docker-compose.prod.yml logs -f

# Specific service
docker compose -f deploy/docker-compose.prod.yml logs -f backend
```

### Restart Services

```bash
docker compose -f deploy/docker-compose.prod.yml restart
```

### Clean Up Old Images

```bash
docker image prune -f
```
