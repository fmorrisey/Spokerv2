# Building JWT Authentication for Spoker v2

A step-by-step guide to implementing JWT-based authentication in the Spoker v2 backend, following the existing architecture patterns.

**Issue**: #39 — Design and implement JWT auth backend
**Milestone**: M1: Authentication & Users

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install Dependencies](#2-install-dependencies)
3. [Define the OpenAPI Spec](#3-define-the-openapi-spec)
4. [Generate Types](#4-generate-types)
5. [Create User Types](#5-create-user-types)
6. [Create the User Model](#6-create-the-user-model)
7. [Create the Refresh Token Model](#7-create-the-refresh-token-model)
8. [Add Constants](#8-add-constants)
9. [Configure Environment Variables](#9-configure-environment-variables)
10. [Build the Auth Service](#10-build-the-auth-service)
11. [Build the Auth Middleware](#11-build-the-auth-middleware)
12. [Build the Sanitization Middleware](#12-build-the-sanitization-middleware)
13. [Build the Auth Controller](#13-build-the-auth-controller)
14. [Build the Auth Route](#14-build-the-auth-route)
15. [Protect Product Routes](#15-protect-product-routes)
16. [Wire Everything into app.ts](#16-wire-everything-into-appts)
17. [Write Tests](#17-write-tests)
18. [Verify End-to-End](#18-verify-end-to-end)

---

## 1. Prerequisites

Before starting, make sure you understand the existing architecture:

- **Pattern**: Route → Controller → Service → Model
- **Example flow**: `product.route.ts` → `product.controller.ts` → `product.service.ts` → `product.model.ts`
- **OpenAPI**: YAML specs in `backend/docs/` are the source of truth for types
- **Type generation**: `npm run swagger:gen` generates TypeScript types from YAML specs

**Key files to reference**:
- `backend/docs/product.yaml` — OpenAPI spec pattern
- `backend/src/types/product.type.ts` — Type extraction pattern
- `backend/src/models/product.model.ts` — Mongoose model pattern
- `backend/src/services/product.service.ts` — Service layer pattern
- `backend/src/controllers/product.controller.ts` — Controller pattern
- `backend/src/routes/product.route.ts` — Route pattern
- `backend/src/middleware/errorHandler.ts` — Error handling pattern (reads `error.statusCode`)
- `backend/src/app.ts` — Where everything gets wired together

---

## 2. Install Dependencies

From the `backend/` directory:

```bash
npm install jsonwebtoken bcryptjs cookie-parser express-mongo-sanitize
npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/cookie-parser
```

**Why these packages**:
- `jsonwebtoken` — Create and verify JWT tokens
- `bcryptjs` — Hash passwords (pure JS, works on Alpine Docker images unlike native `bcrypt`)
- `cookie-parser` — Parse cookies from incoming requests (Express doesn't do this by default)
- `express-mongo-sanitize` — Prevent NoSQL injection by stripping `$` and `.` from request bodies

---

## 3. Define the OpenAPI Spec

Create `backend/docs/user.yaml`. This defines the API contract — all schemas and endpoints for authentication.

Follow the same structure as `backend/docs/product.yaml`:

```yaml
paths:
  /api/v1/auth/register:
    post:
      summary: Register a new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User registered successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '409':
          description: Email already registered

  /api/v1/auth/login:
    post:
      summary: Log in with email and password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid credentials

  /api/v1/auth/refresh:
    post:
      summary: Refresh the access token using the refresh token cookie
      responses:
        '200':
          description: Token refreshed successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          description: Invalid or expired refresh token

  /api/v1/auth/logout:
    post:
      summary: Log out and invalidate refresh token
      responses:
        '200':
          description: Logged out successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageResponse'

components:
  schemas:
    User:
      type: object
      properties:
        _id:
          type: string
          description: MongoDB ObjectId
          readOnly: true
        email:
          type: string
          format: email
        name:
          type: string
        role:
          type: string
          enum: [user, admin]
          default: user
        createdAt:
          type: string
          format: date-time
          readOnly: true
        updatedAt:
          type: string
          format: date-time
          readOnly: true
      required:
        - email
        - name

    RegisterRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        name:
          type: string
      required:
        - email
        - password
        - name

    LoginRequest:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
      required:
        - email
        - password

    AuthResponse:
      type: object
      properties:
        accessToken:
          type: string
        user:
          $ref: '#/components/schemas/User'
      required:
        - accessToken
        - user

    MessageResponse:
      type: object
      properties:
        message:
          type: string
      required:
        - message

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

**Design notes**:
- The `User` schema never includes `passwordHash` — it's stored in the DB but never returned to clients
- `RegisterRequest` has `password` (plaintext from the user), which the service hashes before storing
- `AuthResponse` returns the access token in the JSON body; the refresh token goes in an httpOnly cookie (not in the API response body)
- The `role` field defaults to `user` — this is the foundation for RBAC (issue #42)

---

## 4. Generate Types

From the project root:

```bash
npm run swagger:gen
```

This will create:
- `backend/src/swagger/user.ts` — Backend types
- `frontend/src/swagger/user.ts` — Frontend types
- `frontend/src/swagger/index.ts` — Updated unified index (now includes `UserPaths` and `UserComponents`)

Verify these files were created before continuing.

---

## 5. Create User Types

Create `backend/src/types/user.type.ts`:

Follow the exact pattern from `backend/src/types/product.type.ts`:

```typescript
import { components } from '../../src/swagger/user';

export type UserType = components['schemas']['User'];
export type RegisterRequestType = components['schemas']['RegisterRequest'];
export type LoginRequestType = components['schemas']['LoginRequest'];
export type AuthResponseType = components['schemas']['AuthResponse'];
export type MessageResponseType = components['schemas']['MessageResponse'];
```

This derives all types from the OpenAPI spec, keeping it as the single source of truth.

---

## 6. Create the User Model

Create `backend/src/models/user.model.ts`:

Follow the dual-interface pattern from `backend/src/models/product.model.ts`:

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

interface UserModel extends Model<IUser> {}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
```

**Key decisions**:
- `unique: true` on email enforces uniqueness at the database level
- `lowercase: true` normalizes emails so `User@Email.com` and `user@email.com` are the same
- `timestamps: true` tells Mongoose to auto-manage `createdAt` and `updatedAt`
- `passwordHash` is in the Mongoose schema but NOT in the OpenAPI `User` schema — this is intentional

---

## 7. Create the Refresh Token Model

Create `backend/src/models/refreshToken.model.ts`:

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

interface IRefreshToken extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

interface RefreshTokenModel extends Model<IRefreshToken> {}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const RefreshToken = mongoose.model<IRefreshToken, RefreshTokenModel>(
  'RefreshToken',
  refreshTokenSchema
);
```

**Why store refresh tokens in the database?**
- Enables logout (delete the token → it's no longer valid)
- Supports "logout from all devices" (delete all tokens for a user)
- The TTL index (`index: { expires: 0 }`) on `expiresAt` makes MongoDB automatically delete expired tokens — no cleanup cron needed

---

## 8. Add Constants

Modify `backend/src/models/constants.ts`:

Add to the `Routes` class:

```typescript
static readonly AUTH = '/auth'
```

Add these new constants below the existing ones:

```typescript
export const JWT_ACCESS_EXPIRATION = '15m';
export const JWT_REFRESH_EXPIRATION = '7d';
export const REFRESH_COOKIE_NAME = 'refresh_token';
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
```

**Note**: The actual JWT secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`) come from environment variables, not constants. Never hardcode secrets.

---

## 9. Configure Environment Variables

Update `backend/.env.example` — replace the existing JWT placeholder comments (lines 32-34) with:

```env
# JWT Configuration (required)
JWT_SECRET=your-jwt-access-secret-here-change-in-production
JWT_REFRESH_SECRET=your-jwt-refresh-secret-here-change-in-production
```

Add actual values to your `backend/.env` for development:

```env
# JWT Configuration
JWT_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
```

For production, generate real secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Why two separate secrets?** If the access token secret is compromised, an attacker can forge access tokens (15min window) but can't generate valid refresh tokens. And vice versa. Defense in depth.

---

## 10. Build the Auth Service

Create `backend/src/services/auth.service.ts`:

This follows the same pattern as `backend/src/services/product.service.ts` — named async function exports, no classes.

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { RefreshToken } from '../models/refreshToken.model';
import { UserType, RegisterRequestType, LoginRequestType } from '../types/user.type';
import {
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
  REFRESH_COOKIE_MAX_AGE,
} from '../models/constants';

const SALT_ROUNDS = 12;

// --- Helper functions ---

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is not set');
  return secret;
}

function toUserResponse(userDoc: any): UserType {
  const obj = userDoc.toObject ? userDoc.toObject() : userDoc;
  return {
    _id: obj._id.toString(),
    email: obj.email,
    name: obj.name,
    role: obj.role,
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt,
    updatedAt: obj.updatedAt instanceof Date ? obj.updatedAt.toISOString() : obj.updatedAt,
  };
}

// --- Token functions ---

export function generateAccessToken(userId: string, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, getJwtSecret(), {
    expiresIn: JWT_ACCESS_EXPIRATION,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, getJwtRefreshSecret(), {
    expiresIn: JWT_REFRESH_EXPIRATION,
  });

  await RefreshToken.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + REFRESH_COOKIE_MAX_AGE),
  });

  return token;
}

export function verifyAccessToken(token: string): {
  userId: string;
  email: string;
  role: string;
} {
  try {
    return jwt.verify(token, getJwtSecret()) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch {
    throw Object.assign(new Error('Invalid or expired access token'), {
      statusCode: 401,
    });
  }
}

// --- Auth operations ---

export async function register(data: RegisterRequestType): Promise<{
  user: UserType;
  accessToken: string;
  refreshToken: string;
}> {
  // Check for existing user
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), {
      statusCode: 409,
    });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = new User({
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    role: 'user',
  });
  const savedUser = await user.save();

  // Generate tokens
  const userResponse = toUserResponse(savedUser);
  const accessToken = generateAccessToken(
    userResponse._id!,
    userResponse.email,
    userResponse.role
  );
  const refreshToken = await generateRefreshToken(userResponse._id!);

  return { user: userResponse, accessToken, refreshToken };
}

export async function login(data: LoginRequestType): Promise<{
  user: UserType;
  accessToken: string;
  refreshToken: string;
}> {
  // Find user — generic error message prevents user enumeration
  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), {
      statusCode: 401,
    });
  }

  // Verify password
  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw Object.assign(new Error('Invalid email or password'), {
      statusCode: 401,
    });
  }

  // Generate tokens
  const userResponse = toUserResponse(user);
  const accessToken = generateAccessToken(
    userResponse._id!,
    userResponse.email,
    userResponse.role
  );
  const refreshToken = await generateRefreshToken(userResponse._id!);

  return { user: userResponse, accessToken, refreshToken };
}

export async function refreshAccessToken(refreshTokenValue: string): Promise<{
  accessToken: string;
  user: UserType;
}> {
  // Verify JWT signature
  let decoded: any;
  try {
    decoded = jwt.verify(refreshTokenValue, getJwtRefreshSecret());
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), {
      statusCode: 401,
    });
  }

  // Check token exists in DB (hasn't been revoked)
  const storedToken = await RefreshToken.findOne({ token: refreshTokenValue });
  if (!storedToken) {
    throw Object.assign(new Error('Refresh token has been revoked'), {
      statusCode: 401,
    });
  }

  // Fetch user
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 401 });
  }

  const userResponse = toUserResponse(user);
  const accessToken = generateAccessToken(
    userResponse._id!,
    userResponse.email,
    userResponse.role
  );

  return { accessToken, user: userResponse };
}

export async function logout(refreshTokenValue: string): Promise<void> {
  await RefreshToken.deleteOne({ token: refreshTokenValue });
}
```

**Important patterns to understand**:

1. **Error convention**: `Object.assign(new Error('...'), { statusCode: N })` — The existing error handler at `backend/src/middleware/errorHandler.ts` reads `error.statusCode` (line 9) and uses it as the HTTP status code. This is how the entire app communicates error status codes.

2. **Generic login errors**: Both "wrong email" and "wrong password" return the same `"Invalid email or password"` message. This prevents attackers from probing which emails are registered (user enumeration).

3. **`toUserResponse` helper**: Converts a Mongoose document to the API's `UserType`, stripping out `passwordHash` and converting dates to ISO strings.

4. **Salt rounds = 12**: A good balance. Each increment roughly doubles the hash time. 12 takes ~250ms which is fine for auth but makes brute force impractical.

---

## 11. Build the Auth Middleware

Create `backend/src/middleware/authenticate.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/auth.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'fail',
      error: 'Authentication required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      status: 'fail',
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
}
```

**How this connects to the frontend**: The existing frontend middleware at `frontend/src/app/services/apiClient/api-client.service.ts` already:
- Reads `auth_token` from localStorage and adds `Authorization: Bearer <token>` to requests
- Removes the token from localStorage when it gets a 401 response

So this middleware is already compatible with the frontend. The frontend just needs to store the access token after login (which is a frontend issue, not this one).

**Why `AuthenticatedRequest`?** TypeScript's `Request` type doesn't have a `user` property. This extended interface lets downstream controllers access `req.user` with type safety. Controllers that use protected routes should cast `req` to `AuthenticatedRequest`.

---

## 12. Build the Sanitization Middleware

Create `backend/src/middleware/sanitize.ts`:

```typescript
import mongoSanitize from 'express-mongo-sanitize';
import { Request, Response, NextFunction } from 'express';

// Prevents NoSQL injection (strips $ and . from request body/query/params)
export const mongoSanitizeMiddleware = mongoSanitize();

// Strips HTML tags from all string values in request body
export function stripHtmlTags(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/<[^>]*>/g, '').trim();
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
```

**What each layer prevents**:
- `mongoSanitize()` — Blocks NoSQL injection like `{"email": {"$gt": ""}, "password": "anything"}` which would match any user
- `stripHtmlTags` — Blocks stored XSS like `<script>alert('xss')</script>` in product names or user names

Both are applied globally (before routes) so every endpoint is protected.

---

## 13. Build the Auth Controller

Create `backend/src/controllers/auth.controller.ts`:

Follow the pattern from `backend/src/controllers/product.controller.ts`:

```typescript
import { NextFunction, Request, RequestHandler, Response } from 'express';
import * as AuthService from '../services/auth.service';
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE,
} from '../models/constants';

// --- Cookie helpers ---

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/v1/auth',
  });
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
  });
}

// --- Route handlers ---

export const register: RequestHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.register(
      req.body
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(201).json({ accessToken, user });
  } catch (error) {
    next?.(error);
  }
};

export const login: RequestHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { user, accessToken, refreshToken } = await AuthService.login(
      req.body
    );
    setRefreshTokenCookie(res, refreshToken);
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next?.(error);
  }
};

export const refresh: RequestHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const refreshTokenValue = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!refreshTokenValue) {
      return next?.(
        Object.assign(new Error('No refresh token provided'), {
          statusCode: 401,
        })
      );
    }
    const { accessToken, user } = await AuthService.refreshAccessToken(
      refreshTokenValue
    );
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next?.(error);
  }
};

export const logout: RequestHandler = async (
  req: Request,
  res: Response,
  next?: NextFunction
) => {
  try {
    const refreshTokenValue = req.cookies?.[REFRESH_COOKIE_NAME];
    if (refreshTokenValue) {
      await AuthService.logout(refreshTokenValue);
    }
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next?.(error);
  }
};
```

**Cookie design decisions**:
- `httpOnly: true` — JavaScript cannot read this cookie (prevents XSS from stealing refresh tokens)
- `secure: true` in production — Cookie only sent over HTTPS (allow HTTP in dev)
- `sameSite: 'strict'` — Cookie not sent on cross-origin requests (prevents CSRF)
- `path: '/api/v1/auth'` — Browser only sends this cookie to auth endpoints, not every API call

**Why the controller handles cookies but the service doesn't**: The service layer is pure business logic — it returns the refresh token string. The controller decides how to deliver it (httpOnly cookie). This separation makes testing easier and keeps the service framework-agnostic.

---

## 14. Build the Auth Route

Create `backend/src/routes/auth.route.ts`:

Follow the pattern from `backend/src/routes/product.route.ts`:

```typescript
import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
```

All four endpoints are `POST` — even logout, because it has a side effect (invalidating the token).

---

## 15. Protect Product Routes

Modify `backend/src/routes/product.route.ts`:

Add the `authenticate` middleware to mutation endpoints while keeping reads public:

```typescript
import express from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProductById,
  deleteProductById,
} from "../controllers/product.controller";
import { authenticate } from "../middleware/authenticate";
import { ProductType } from '../../src/types/product.type';

const router = express.Router();

// Public routes — anyone can browse products
router.get<{}, ProductType[]>('/', getAllProducts);
router.get<{ id: string }, ProductType | null>('/:id', getProductById);

// Protected routes — must be logged in to modify products
router.post<{}, ProductType>('/', authenticate, createProduct);
router.put<{ id: string }, ProductType | null>('/:id', authenticate, updateProductById);
router.delete<{ id: string }, void>('/:id', authenticate, deleteProductById);

export default router;
```

**How Express middleware chaining works**: When you write `router.post('/', authenticate, createProduct)`, Express runs `authenticate` first. If it calls `next()`, Express runs `createProduct`. If `authenticate` sends a response (like 401) without calling `next()`, `createProduct` never runs.

---

## 16. Wire Everything into app.ts

Modify `backend/src/app.ts` to add the new middleware and routes.

**Imports to add** (at the top, with the other imports):

```typescript
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route';
import {
  mongoSanitizeMiddleware,
  stripHtmlTags,
} from './middleware/sanitize';
```

**Middleware to add** (after `app.use(express.json())`):

```typescript
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);
app.use(stripHtmlTags);
```

**Route to add** (in the routes section, before product routes):

```typescript
app.use(API_URL + Routes.AUTH, authRoutes);
```

**The final middleware order should be**:

```
express.json()          ← Parse JSON bodies
cookieParser()          ← Parse cookies (NEW)
mongoSanitizeMiddleware ← Strip NoSQL injection chars (NEW)
stripHtmlTags           ← Strip HTML from strings (NEW)
cors(corsOptions)       ← Handle CORS
helmet(...)             ← Security headers
setupSwagger (dev only) ← API docs
routes:
  health                ← /api/v1/health
  auth                  ← /api/v1/auth/* (NEW)
  products              ← /api/v1/products
errorHandler            ← Catch-all error handler (must be last)
```

---

## 17. Write Tests

### 17a. Auth Service Unit Tests

Create `backend/tests/services/auth.service.spec.ts`:

This tests the business logic in isolation using `jest.spyOn` to mock database calls.

**Tests to write**:

| Test | What it verifies |
|------|-----------------|
| `generateAccessToken` returns a valid JWT | Token can be decoded, contains userId/email/role |
| `verifyAccessToken` succeeds for valid token | Returns decoded payload |
| `verifyAccessToken` throws 401 for expired token | Use a token signed with `expiresIn: '0s'` |
| `verifyAccessToken` throws 401 for invalid token | Pass a garbage string |
| `register` creates user and returns tokens | Mock `User.findOne` → null, mock `User.save` |
| `register` throws 409 for duplicate email | Mock `User.findOne` → existing user |
| `login` returns tokens for valid credentials | Mock `User.findOne` → user, mock `bcrypt.compare` → true |
| `login` throws 401 for unknown email | Mock `User.findOne` → null |
| `login` throws 401 for wrong password | Mock `bcrypt.compare` → false |
| `refreshAccessToken` returns new access token | Mock `jwt.verify`, `RefreshToken.findOne`, `User.findById` |
| `refreshAccessToken` throws 401 for revoked token | Mock `RefreshToken.findOne` → null |
| `logout` deletes the refresh token | Mock `RefreshToken.deleteOne`, verify it was called |

**Setup**:
```typescript
beforeEach(() => {
  process.env.JWT_SECRET = 'test-access-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  jest.clearAllMocks();
});
```

**Mocking approach** — follow the pattern from `backend/tests/api/product.spec.ts`:
```typescript
jest.spyOn(User, 'findOne').mockResolvedValue(null);
jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
```

### 17b. Auth Middleware Unit Tests

Create `backend/tests/middleware/authenticate.spec.ts`:

Follow the mock req/res/next pattern from `backend/tests/services/errorHandler.spec.ts`:

| Test | What it verifies |
|------|-----------------|
| No Authorization header → 401 | Returns JSON error, does not call `next()` |
| Authorization without "Bearer " prefix → 401 | Returns JSON error |
| Expired/invalid token → 401 | Returns JSON error |
| Valid token → sets `req.user` and calls `next()` | Verify `req.user` has correct fields |

### 17c. Sanitization Middleware Unit Tests

Create `backend/tests/middleware/sanitize.spec.ts`:

| Test | What it verifies |
|------|-----------------|
| Strips `<script>` tags from body strings | `req.body.name` goes from `"<script>alert('x')</script>Test"` to `"alert('x')Test"` |
| Handles nested objects | Deeply nested strings are sanitized |
| Handles arrays | Array elements are sanitized |
| Non-string values pass through | Numbers, booleans unchanged |
| Calls `next()` | Middleware doesn't block the chain |

### 17d. Auth API Integration Tests

Create `backend/tests/api/auth.spec.ts`:

Follow the supertest pattern from `backend/tests/api/product.spec.ts`:

| Test | What it verifies |
|------|-----------------|
| `POST /auth/register` → 201 with accessToken and user | Mock `AuthService.register` |
| `POST /auth/register` → 409 for duplicate | Mock `AuthService.register` throwing 409 |
| `POST /auth/login` → 200 with accessToken and user | Mock `AuthService.login` |
| `POST /auth/login` → 401 for bad credentials | Mock `AuthService.login` throwing 401 |
| `POST /auth/refresh` → 401 when no cookie | No setup needed |
| `POST /auth/logout` → 200 | Mock `AuthService.logout` |
| `POST /products` → 401 without auth token | Verify protected route |
| `GET /products` → 200 without auth token | Verify public route still works |

**Supertest cookie handling**: Supertest doesn't persist cookies automatically. For refresh tests, extract the `Set-Cookie` header and pass it back:
```typescript
const loginRes = await request(app).post('/api/v1/auth/login').send({...});
const cookies = loginRes.headers['set-cookie'];
const refreshRes = await request(app)
  .post('/api/v1/auth/refresh')
  .set('Cookie', cookies);
```

---

## 18. Verify End-to-End

### Step 1: Generate types
```bash
npm run swagger:gen
```
Verify `backend/src/swagger/user.ts` and `frontend/src/swagger/user.ts` exist.

### Step 2: Run tests
```bash
npm run test:backend
```
All existing product tests should still pass. All new auth tests should pass.

### Step 3: Start the dev server
```bash
npm run docker:dev
```
Verify the server starts without errors.

### Step 4: Manual curl tests

```bash
# 1. Register a new user
curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  -c cookies.txt | python3 -m json.tool

# Expected: 201 with { "accessToken": "...", "user": { ... } }
# cookies.txt should contain a refresh_token cookie

# 2. Login
curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt | python3 -m json.tool

# Expected: 200 with { "accessToken": "...", "user": { ... } }
# Save the accessToken value for the next steps

# 3. Access a protected route WITHOUT a token
curl -s -X POST http://localhost:5001/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test","msrp":10,"price":10}' | python3 -m json.tool

# Expected: 401 { "status": "fail", "error": "Authentication required" }

# 4. Access a protected route WITH a token
curl -s -X POST http://localhost:5001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{"name":"Test Product","description":"A test","msrp":10,"price":10}' | python3 -m json.tool

# Expected: 201 with the created product

# 5. Verify public route still works (no auth needed)
curl -s http://localhost:5001/api/v1/products | python3 -m json.tool

# Expected: 200 with product list

# 6. Refresh the access token
curl -s -X POST http://localhost:5001/api/v1/auth/refresh \
  -b cookies.txt | python3 -m json.tool

# Expected: 200 with a new { "accessToken": "...", "user": { ... } }

# 7. Logout
curl -s -X POST http://localhost:5001/api/v1/auth/logout \
  -b cookies.txt | python3 -m json.tool

# Expected: 200 { "message": "Logged out successfully" }

# 8. Try to refresh after logout (should fail)
curl -s -X POST http://localhost:5001/api/v1/auth/refresh \
  -b cookies.txt | python3 -m json.tool

# Expected: 401 (refresh token was deleted from DB)

# 9. Test NoSQL injection protection
curl -s -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":"anything"}' | python3 -m json.tool

# Expected: 401 (not a successful login — the $gt was stripped)

# 10. Test HTML sanitization
curl -s -X POST http://localhost:5001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"xss@test.com","password":"password123","name":"<script>alert(1)</script>Evil"}' \
  -c cookies.txt | python3 -m json.tool

# Expected: 201, but user.name should be "alert(1)Evil" (tags stripped)
```

---

## Token Flow Diagram

```
                     ┌─────────────┐
                     │   Frontend  │
                     └──────┬──────┘
                            │
              POST /auth/login
              { email, password }
                            │
                     ┌──────▼──────┐
                     │   Backend   │
                     │             │
                     │ 1. Verify   │
                     │    password │
                     │ 2. Generate │
                     │    tokens   │
                     └──────┬──────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    JSON body          Set-Cookie           MongoDB
    { accessToken,     refresh_token=...    RefreshToken
      user: {...} }    HttpOnly; Secure     { token, userId,
         │                  │                expiresAt }
         │                  │                  │
         ▼                  ▼                  │
    localStorage       Browser cookie         │
    auth_token=...     (auto-sent to          │
         │              /api/v1/auth)          │
         │                  │                  │
         ▼                  │                  │
    Authorization:          │                  │
    Bearer <token>          │                  │
    (sent on ALL            │                  │
     API requests)          │                  │
         │                  │                  │
         │    POST /auth/refresh               │
         │         ┌────────┘                  │
         │         │                           │
         │         ▼                           │
         │    Cookie sent ──────► Lookup in DB─┘
         │    automatically       (validate)
         │         │
         │         ▼
         │    New accessToken
         │    returned in body
         │         │
         ▼         ▼
    Update localStorage
    with new token
```

---

## File Checklist

| Status | Action | File |
|--------|--------|------|
| [ ] | Create | `backend/docs/user.yaml` |
| [ ] | Run | `npm run swagger:gen` |
| [ ] | Create | `backend/src/types/user.type.ts` |
| [ ] | Create | `backend/src/models/user.model.ts` |
| [ ] | Create | `backend/src/models/refreshToken.model.ts` |
| [ ] | Modify | `backend/src/models/constants.ts` |
| [ ] | Modify | `backend/.env.example` and `backend/.env` |
| [ ] | Create | `backend/src/services/auth.service.ts` |
| [ ] | Create | `backend/src/middleware/authenticate.ts` |
| [ ] | Create | `backend/src/middleware/sanitize.ts` |
| [ ] | Create | `backend/src/controllers/auth.controller.ts` |
| [ ] | Create | `backend/src/routes/auth.route.ts` |
| [ ] | Modify | `backend/src/routes/product.route.ts` |
| [ ] | Modify | `backend/src/app.ts` |
| [ ] | Create | `backend/tests/services/auth.service.spec.ts` |
| [ ] | Create | `backend/tests/middleware/authenticate.spec.ts` |
| [ ] | Create | `backend/tests/middleware/sanitize.spec.ts` |
| [ ] | Create | `backend/tests/api/auth.spec.ts` |
| [ ] | Run | `npm run test:backend` |
| [ ] | Verify | Manual curl tests |
