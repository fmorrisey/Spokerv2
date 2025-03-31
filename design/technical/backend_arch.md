# Spoker V2 Backend Architecture  

```
/backend
 ├── cypress/
 ├── src/
 │   ├── controllers/    # Business logic (product, user, order)
 │   ├── models/         # Mongoose schemas & interfaces
 │   ├── routes/         # API endpoints
 │   ├── middlewares/    # Auth, error handling
 │   ├── services/       # Database queries, caching
 │   ├── utils/          # Helpers (logging, validations)
 │   ├── app.ts          # Main Express app
 │   ├── server.ts       # Server entry point
 ├── package.json
 ├── tsconfig.json
 ├── .env 
 ├── nodemon.json       # Config for Development Environment 
 ├── Dockerfile         # Dockerfile for the production builds
 ├── Dockerfile.dev     # Dockerfile for the development environments
 
```

## Technologies
- Node server written in TypeScript
- MongoDB with Mongoose
- RBAC with JWT + Bcrypt
- Email Service (TBD / NodeMailer?)

## API V1 Endpoints
### General Server
- `/api/v1/health` : returns a 200 if the server is live along with connection state of mongoDB

### Items
- `/api/v1/items` : returns a list of items in the database

## Testing
Cypress-Gherkin for API Testing
Jest for unit testing

## Logging
- Service to handle and process font and backend logs


