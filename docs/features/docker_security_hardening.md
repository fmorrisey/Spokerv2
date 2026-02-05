# Feature: Docker Security Hardening

## Summary
Harden Docker containers for production by running as non-root users and adding resource limits.

## Tasks

### 1. Run Backend Container as Non-Root User
**File:** `backend/Dockerfile`

The container currently runs as root. Add a non-root user for production security.

```dockerfile
FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package.json package-lock.json ./
RUN npm ci --production=true

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs
ENV NODE_ENV=production
EXPOSE 5001

CMD ["node", "dist/server.js"]
```

### 2. Run Frontend Container as Non-Root User
**File:** `frontend/Dockerfile`

Option A: Use nginx unprivileged image:
```dockerfile
FROM nginxinc/nginx-unprivileged:stable-alpine
```

Option B: Configure nginx to run on port 8080 and run entirely unprivileged.

### 3. Add Resource Limits to Docker Compose
**File:** `deploy/docker-compose.prod.yml`

Prevent resource exhaustion on the host:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M

  frontend:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
        reservations:
          memory: 128M

  caddy:
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.25'
```

### 4. Add Logging Configuration
**File:** `deploy/docker-compose.prod.yml`

Prevent disk exhaustion from container logs:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Priority
Medium - Important for production hardening but not blocking deployment.

## Labels
`infrastructure`, `security`, `docker`
