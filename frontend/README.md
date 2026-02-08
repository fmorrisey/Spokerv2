# Spokerv2 Frontend

[![Spoker V2 Frontend CI/CD Pipeline](https://github.com/fmorrisey/Spokerv2/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/fmorrisey/Spokerv2/actions/workflows/ci.yml)

## Setup

```bash
npm run setup
```

This installs dependencies, Cypress binary, and generates API types from Swagger.

## Development

```bash
npm start
```

Navigate to http://localhost:4200/. The app reloads automatically on file changes.

## Build

```bash
npm run build
```

Build artifacts are stored in the `dist/` directory.

## Testing

### Unit Tests

```bash
npm test
```

Executes unit tests via Karma. Coverage report is generated at `/coverage`.

### E2E Tests (Cypress)

| Command | Description |
|---------|-------------|
| `npm run cy` | Start server + run all E2E tests |
| `npm run cy:open` | Open Cypress GUI (server must be running) |
| `npm run cy:run` | Run Cypress headless (server must be running) |
| `npm run cy:vnc` | Start VNC container for visual debugging |

### CI Commands

These expect the application to already be running:

```bash
npm run ci:cy:chrome
npm run ci:cy:firefox
```

## API Types

Regenerate TypeScript types from backend Swagger:

```bash
npm run swagger:gen
```
