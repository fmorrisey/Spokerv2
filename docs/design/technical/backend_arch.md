# Spoker V2 Backend Architecture

## Technology Stack
- **Node.js** with Express.js
- **TypeScript 5.8**
- **MongoDB** with Mongoose ODM
- **OpenAPI 3.0** with Swagger UI
- **Jest** for unit testing
- **Helmet** for security headers

## Project Structure

```
/backend
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build (nodemon)
├── tests/                  # Jest unit tests
├── docs/                   # OpenAPI YAML specs
└── src/
    ├── config/
    │   ├── mongodb.ts      # Database connection
    │   ├── swagger.ts      # Swagger configuration
    │   └── test-db.ts      # Test database setup
    ├── controllers/
    │   └── product.controller.ts
    ├── services/
    │   ├── product.service.ts
    │   ├── health.service.ts
    │   └── error.service.ts
    ├── routes/
    │   └── product.route.ts
    ├── models/
    │   ├── product.model.ts
    │   └── constants.ts
    ├── middleware/
    │   ├── errorHandler.ts
    │   └── healthCheck.ts
    ├── swagger/            # Generated types from OpenAPI
    ├── app.ts              # Express app setup
    └── server.ts           # Server entry point
```

## Architecture Pattern

**Route → Controller → Service → Model**

```
HTTP Request
    ↓
Route (product.route.ts)     # Define endpoints
    ↓
Controller (product.controller.ts)  # Handle request/response
    ↓
Service (product.service.ts)   # Business logic
    ↓
Model (product.model.ts)       # Database operations
    ↓
MongoDB
```

## API Endpoints

### Health
- `GET /api/v1/health` - Server health check with MongoDB status

### Products (CRUD)
- `GET /api/v1/products` - List all products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product by ID
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### OpenAPI Documentation
- `GET /api-docs/` - Swagger UI (development only)

## Configuration

### Environment Variables
See `backend/.env.example`:
```bash
NODE_ENV=production
PORT=5001
DB_URI=mongodb://db:27017/ecommerce
ALLOWED_ORIGINS=https://yourdomain.com
```

### CORS
- **Development**: Allows all origins
- **Production**: Restricted to `ALLOWED_ORIGINS` (required)

## Security
- Helmet middleware for security headers
- CORS with environment-based restrictions
- Swagger disabled in production
- Server binds to `0.0.0.0` for container networking

## Testing

### Unit Tests (Jest)
```bash
npm test                    # Run all tests
npm run test:unit           # With coverage
npx jest tests/api/product.spec.ts  # Single file
```

## Type Generation

OpenAPI specs in `docs/*.yaml` are the source of truth. Run from project root:
```bash
npm run swagger:gen
```

Generates types to:
- `backend/src/swagger/`
- `frontend/src/swagger/`
