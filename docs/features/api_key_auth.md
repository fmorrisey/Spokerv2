# Feature: API Key Authentication

## Summary
Implement API key authentication to secure backend endpoints and enable controlled third-party access in the future.

## Context
Currently the API is only accessible via the same-origin app (CORS restricted). Adding API key auth would:
- Provide an additional layer of security
- Enable future integrations (mobile apps, third-party services)
- Allow rate limiting per API key

## Implementation

### 1. API Key Generation
- Generate secure random API keys (256-bit)
- Store hashed keys in MongoDB
- Associate keys with user accounts or service accounts

### 2. Authentication Middleware
```typescript
// middleware/apiKeyAuth.ts
export const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const hashedKey = hashApiKey(apiKey);
  const keyRecord = await ApiKey.findOne({ hashedKey, active: true });

  if (!keyRecord) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKeyOwner = keyRecord.owner;
  next();
};
```

### 3. Rate Limiting
- Implement per-key rate limits
- Use Redis or in-memory store for rate tracking
- Return 429 Too Many Requests when exceeded

### 4. Key Management API
- `POST /api/v1/keys` - Generate new API key
- `GET /api/v1/keys` - List user's API keys (masked)
- `DELETE /api/v1/keys/:id` - Revoke API key

### 5. Documentation
- Update Swagger/OpenAPI spec with API key auth
- Document key rotation best practices

## Security Considerations
- Never log or expose full API keys
- Implement key rotation mechanism
- Set reasonable rate limits
- Monitor for suspicious activity

## Priority
Medium - Not needed for MVP but important for production security.

## Labels
`security`, `backend`, `api`
