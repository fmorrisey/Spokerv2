# Environment Configuration Guide

## Overview

This application uses a robust environment configuration system that works across different deployment scenarios:
- **Local Development**: Localhost or network access (e.g., iPad on same network)
- **Production**: Docker containers with nginx reverse proxy

## Architecture

### Development Mode
- Frontend: Direct connection to backend at `hostname:5001`
- Backend: Listens on `0.0.0.0:5001` (accessible from network)
- CORS: Permissive (allows all origins)

### Production Mode
- Frontend: Uses relative paths, proxied through nginx
- Backend: Accessible only through nginx reverse proxy
- CORS: Restrictive (configured via `ALLOWED_ORIGINS`)
- Nginx: Routes `/api/*` to backend, everything else to frontend

## Configuration Files

### Frontend

#### `environment.ts` (Development)
- Auto-detects hostname for network access
- Supports runtime configuration via `window.__env`
- Falls back to `localhost:5001` for SSR

#### `environment.prod.ts` (Production)
- Uses empty apiUrl (relative paths) by default
- Nginx proxies all `/api/*` requests to backend
- Supports runtime configuration for external APIs

#### `assets/env.template.js`
- Template for runtime environment injection
- Replaced at container startup with actual values

### Backend

#### `.env` File
Required environment variables:
```bash
NODE_ENV=production
PORT=5001
DB_URI=mongodb://db:27017/ecommerce
ALLOWED_ORIGINS=http://localhost:3200,https://yourdomain.com
API_VERSION=v1
```

## Deployment Scenarios

### 1. Local Development (Localhost)

**Start services:**
```bash
cd frontend && npm start  # Runs on 0.0.0.0:4200
cd backend && npm run dev  # Runs on 0.0.0.0:5001
```

**Access:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5001`

### 2. Local Development (Network Access - iPad)

**Find your IP:**
```bash
hostname -I | awk '{print $1}'
```

**Access from iPad:**
- Frontend: `http://YOUR_IP:4200`
- API calls automatically route to: `http://YOUR_IP:5001`

### 3. Docker Development

```bash
docker-compose -f docker-compose.dev.yml up
```

**Access:**
- Frontend: `http://localhost:4200` or `http://YOUR_IP:4200`
- Backend: `http://localhost:5001` or `http://YOUR_IP:5001`

### 4. Docker Production

```bash
# Create .env file from example
cp backend/.env.example backend/.env
# Edit .env with your values

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

**Access:**
- Application: `http://localhost:3200`
- All `/api/*` requests automatically proxied to backend

### 5. Production with Custom Domain

**Update environment variables:**
```yaml
# docker-compose.prod.yml
frontend:
  environment:
    - API_URL=  # Empty = use nginx proxy (recommended)
    
backend:
  environment:
    - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Update nginx:**
```nginx
# nginx/default.conf
server_name yourdomain.com www.yourdomain.com;
```

### 6. Separate Backend Deployment

If backend is hosted separately (e.g., different server, cloud service):

**Frontend:**
```yaml
environment:
  - API_URL=https://api.yourdomain.com
```

**Backend:**
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## Security Considerations

### Development
- ✅ CORS allows all origins
- ✅ Debug mode enabled
- ✅ Detailed error messages
- ⚠️ Swagger docs exposed

### Production
- ✅ CORS restricted to specific origins
- ✅ Debug mode disabled
- ✅ Generic error messages
- ✅ Helmet security headers
- ✅ Swagger docs disabled
- ✅ Backend not directly accessible (nginx proxy only)

## Troubleshooting

### Network Error on iPad
- Verify backend is running: `curl http://YOUR_IP:5001/api/v1/health`
- Check firewall allows port 5001
- Ensure backend listens on `0.0.0.0` not `localhost`

### CORS Errors in Production
- Verify `ALLOWED_ORIGINS` includes your domain
- Check nginx proxy headers are set correctly
- Ensure frontend uses relative paths (empty `apiUrl`)

### Environment Variables Not Applied
- Rebuild Docker images: `docker-compose build --no-cache`
- Check `docker-entrypoint.sh` is executable
- Verify `env.js` is generated: `docker exec <container> cat /usr/share/nginx/html/assets/env.js`

## Runtime Configuration

The frontend supports runtime configuration injection, useful for:
- Different staging environments
- Cloud deployments (AWS ECS, Kubernetes)
- CI/CD pipelines

**Example - Inject at container startup:**
```bash
docker run -e API_URL=https://api.staging.com \
           -e ENABLE_ANALYTICS=false \
           spokerv2-frontend-prod
```

The entrypoint script will replace placeholders in `env.template.js`.
