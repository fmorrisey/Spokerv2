# Spoker V2 Frontend Architecture

## Technology Stack
- **Angular 17** with standalone components (no NgModules)
- **TypeScript 5.4**
- **Angular Signals** for reactive state management
- **openapi-fetch** for type-safe API calls
- **Jasmine/Karma** for unit testing
- **Cypress** for E2E testing

## Project Structure

```
/frontend
├── Dockerfile              # Production build (nginx)
├── Dockerfile.dev          # Development build (ng serve)
├── docker-entrypoint.sh    # Container startup script
├── cypress/                # Cypress E2E tests
└── src/
    ├── app/
    │   ├── components/
    │   │   └── dashboard/
    │   │       ├── dashboard.component.ts
    │   │       └── products/
    │   │           └── products.component.ts
    │   ├── services/
    │   │   ├── config.service.ts       # App configuration
    │   │   ├── apiClient/
    │   │   │   └── api-client.service.ts  # Type-safe API client
    │   │   └── product/
    │   │       └── product.service.ts  # Product CRUD with Signals
    │   ├── app.component.ts
    │   ├── app.config.ts
    │   └── app.routes.ts
    ├── environment/
    │   ├── environment.ts      # Development config
    │   └── environment.prod.ts # Production config
    ├── swagger/                # Generated API types
    ├── assets/
    ├── styles.scss
    ├── main.ts
    └── index.html
```

## Key Patterns

### Standalone Components
Angular 17 standalone components - no NgModule boilerplate:
```typescript
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.component.html'
})
export class ProductsComponent { }
```

### Angular Signals for State
Reactive state without RxJS complexity:
```typescript
products = signal<Product[]>([]);
loading = signal(false);
error = signal<string | null>(null);
```

### Type-Safe API Client
Generated types from OpenAPI specs ensure compile-time safety:
```typescript
const client = createClient<ApiPaths>({ baseUrl });
const { data, error } = await client.GET('/api/v1/products');
```

## Environment Configuration

### Development (`environment.ts`)
- Dynamically constructs API URL from `window.location`
- Supports network access (mobile devices on same network)
- Matches page protocol (HTTP/HTTPS)

### Production (`environment.prod.ts`)
- Empty `apiUrl` - uses relative paths
- Nginx proxies `/api/*` to backend

## Testing

### Unit Tests (Jasmine/Karma)
```bash
npm test                    # Run with coverage
ng test --include=**/product.service.spec.ts  # Single file
```

### E2E Tests (Cypress)
```bash
npm run cy:dev              # Interactive mode
npm run cy:run              # Headless mode
```
