# Spoker V2 Backend Architecture  

```
/backend
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
```

## Technologies
- Node server written in TypeScript
- MongoDB with Mongoose
- RBAC with JWT + Bcrypt
- Email Service (TBD / NodeMailer?)

### Logging
- Service to handle and process font and backend logs

