# Environment Configuration Guide

## Overview

This application uses environment-based configuration for different deployment scenarios:
- **Local Development**: Localhost or network access (e.g., iPad on same network)
- **Production**: Docker containers with nginx reverse proxy

## Architecture

### Development Mode
- Frontend: Dynamic connection to backend based on current hostname
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
- Auto-detects hostname and protocol for network access
- Supports HTTPS tunneling (ngrok, Cloudflare Tunnel)
- Falls back to `localhost:5001` for SSR

#### `environment.prod.ts` (Production)
- Uses empty apiUrl (relative paths)
- Nginx proxies all `/api/*` requests to backend

### Backend

#### `.env` File
Required environment variables (see `.env.example`):
```bash
NODE_ENV=production
PORT=5001
DB_URI=mongodb://admin:password@db:27017/ecommerce?authSource=admin
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Deployment Scenarios

### 1. Local Development (Localhost)

```bash
cd frontend && npm start  # Runs on 0.0.0.0:4200
cd backend && npm run dev  # Runs on 0.0.0.0:5001
```

**Access:**
- Frontend: `http://localhost:4200`
- Backend: `http://localhost:5001`
- Swagger: `http://localhost:5001/api-docs/`

### 2. Local Development (Network Access)

```bash
hostname -I | awk '{print $1}'  # Get your IP
```

**Access from mobile/tablet:**
- Frontend: `http://YOUR_IP:4200`
- API calls automatically route to: `http://YOUR_IP:5001`

### 3. Docker Development

```bash
npm run docker:dev
```

### 4. Docker Production

```bash
# Create .env.prod file
cp backend/.env.example backend/.env.prod
# Edit with production values

# Set MONGO_PASSWORD environment variable
export MONGO_PASSWORD=your-secure-password

# Start services
npm run docker:prod
```

**Access:** `http://localhost:3202`

## Security

### Development
- CORS allows all origins
- Debug mode enabled
- Swagger docs exposed at `/api-docs/`

### Production
- CORS restricted to `ALLOWED_ORIGINS`
- Debug mode disabled
- Swagger docs disabled
- MongoDB authentication required
- Nginx security headers enabled

## Troubleshooting

### Network Error on Mobile Device
- Verify backend is running: `curl http://YOUR_IP:5001/api/v1/health`
- Check firewall allows port 5001
- Ensure devices are on same network

### CORS Errors in Production
- Verify `ALLOWED_ORIGINS` includes your domain
- Ensure frontend uses relative paths (empty `apiUrl`)

### Database Connection Failed
- Check `MONGO_PASSWORD` environment variable is set
- Verify MongoDB container is running: `docker ps`
