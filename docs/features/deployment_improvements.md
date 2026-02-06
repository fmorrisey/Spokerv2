# Feature: Deployment Pipeline Improvements

## Summary
Improve deployment reliability with better health checks, validation, and version pinning.

## Tasks

### 1. Fix Backend Healthcheck in Docker Compose
**File:** `deploy/docker-compose.prod.yml`

Current healthcheck uses `nc` which only checks if the port is open, not if the app is healthy. Additionally, `nc` may not be available in the alpine image.

**Current:**
```yaml
healthcheck:
  test: ["CMD", "nc", "-z", "localhost", "5001"]
```

**Recommended:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5001/api/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 2. Add .env.prod Validation to Deploy Script
**File:** `tools/scripts/deploy.sh`

The script doesn't verify that `deploy/.env.prod` exists before running docker compose.

Add after line 32:
```bash
if [ ! -f "deploy/.env.prod" ]; then
    echo -e "${RED}Error: deploy/.env.prod not found${NC}"
    echo -e "Copy deploy/.env.prod.example to deploy/.env.prod and configure it"
    exit 1
fi
```

### 3. Pin Docker Image Versions
**File:** `deploy/docker-compose.prod.yml`

Using `caddy:2-alpine` could lead to unexpected upgrades.

**Current:**
```yaml
image: caddy:2-alpine
```

**Recommended:**
```yaml
image: caddy:2.7-alpine
```

### 4. Pin GitHub Actions to SHA (Optional)
**File:** `.github/workflows/deploy.yml`

For maximum supply chain security, pin actions to specific SHAs:

```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
```

### 5. Add Caddy Security Headers
**File:** `deploy/Caddyfile`

Add defense-in-depth headers at the Caddy level:

```caddyfile
http://spoker-app.rainierserver.com:8080 {
    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    handle /api/* {
        reverse_proxy backend:5001
    }

    handle {
        reverse_proxy frontend:80
    }
}
```

### 6. Improve Rollback Documentation
**File:** `deploy/DEPLOYMENT.md`

Expand rollback section with explicit commands and image retention strategy.

## Priority
Low - Nice-to-have improvements for reliability and security.

## Labels
`infrastructure`, `ci-cd`, `reliability`
