# Environment Configuration - Quick Start

## What Changed

The application now has a hardened configuration system for both development and production.

### Key Improvements

1. **Development**: Automatic network access support (works on iPad/mobile devices)
2. **Production**: Secure nginx proxy setup with relative paths
3. **Runtime Configuration**: Support for environment variable injection at container startup
4. **CORS Security**: Restrictive CORS in production, permissive in development
5. **Backend Binding**: Listens on `0.0.0.0` for external access

## Files Modified

- ✅ [frontend/src/environment/environment.ts](frontend/src/environment/environment.ts) - Dev config with network support
- ✅ [frontend/src/environment/environment.prod.ts](frontend/src/environment/environment.prod.ts) - Production config with nginx proxy
- ✅ [frontend/src/index.html](frontend/src/index.html) - Added runtime config script
- ✅ [frontend/Dockerfile](frontend/Dockerfile) - Added entrypoint for runtime config
- ✅ [backend/src/server.ts](backend/src/server.ts) - Bind to 0.0.0.0:5001
- ✅ [backend/src/app.ts](backend/src/app.ts) - Environment-aware CORS config
- ✅ [docker-compose.prod.yml](docker-compose.prod.yml) - Production env vars

## Files Created

- ✅ [frontend/src/assets/env.js](frontend/src/assets/env.js) - Default runtime config (dev)
- ✅ [frontend/src/assets/env.template.js](frontend/src/assets/env.template.js) - Runtime config template
- ✅ [frontend/docker-entrypoint.sh](frontend/docker-entrypoint.sh) - Startup script for env injection
- ✅ [backend/.env.example](backend/.env.example) - Environment variables documentation
- ✅ [docs/ENVIRONMENT_CONFIG.md](docs/ENVIRONMENT_CONFIG.md) - Complete configuration guide

## Next Steps

### 1. Test Current Changes (iPad Access)

Your iPad should now work! Restart the backend:

```bash
# If using docker-compose
docker-compose -f docker-compose.dev.yml restart backend

# Or if running locally
# Restart your backend server (it now binds to 0.0.0.0)
```

Then refresh your iPad browser.

### 2. For Production Deployment

Create your `.env` file:
```bash
cp backend/.env.example backend/.env
# Edit with your values
nano backend/.env
```

Update `ALLOWED_ORIGINS` with your domain(s):
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Build and Deploy

```bash
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

## Testing

### Test Local (iPad/Mobile)
1. Get your IP: `hostname -I | awk '{print $1}'`
2. Access: `http://YOUR_IP:4200`
3. Products should load automatically

### Test Production
1. Access: `http://localhost:3200`
2. All API calls go through nginx proxy
3. Check network tab - should see `/api/v1/products` (relative path)

## Configuration Summary

| Environment | Frontend URL | API Calls | CORS |
|-------------|--------------|-----------|------|
| **Dev (localhost)** | `localhost:4200` | `localhost:5001` | Permissive |
| **Dev (network)** | `YOUR_IP:4200` | `YOUR_IP:5001` | Permissive |
| **Production** | `yourdomain.com` | `/api/*` (nginx proxy) | Restrictive |

## Rollback

If you need to revert:

```bash
git diff HEAD
git checkout -- backend/src/server.ts backend/src/app.ts
git checkout -- frontend/src/environment/
```

## Documentation

For complete details, see: [docs/ENVIRONMENT_CONFIG.md](docs/ENVIRONMENT_CONFIG.md)
