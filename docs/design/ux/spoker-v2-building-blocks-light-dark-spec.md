# Spoker v2 — Building Blocks Edition (Light + Dark) — Handoff Spec

## 0) Goal
A semantic-token-driven UI foundation that supports **10 stores** via configuration and theming.

---

## 1) Minimal Semantic Color Palette (Light + Dark)

### 1.1 Token list (keep this exact for now)
Neutrals:
- `bg/default`
- `bg/surface`
- `border/default`
- `text/default`
- `text/muted`

Brand:
- `brand/primary`
- `brand/primary-hover`

Status:
- `status/success`
- `status/warning`
- `status/danger`

### 1.2 Recommended values (accessible, neutral, flexible)

> These are intentionally “boring” and adaptable. You can swap brand later without touching components.

**Light**
| Token | Hex |
|---|---|
| bg/default | `#F8FAFC` |
| bg/surface | `#FFFFFF` |
| border/default | `#E2E8F0` |
| text/default | `#0F172A` |
| text/muted | `#475569` |
| brand/primary | `#2563EB` |
| brand/primary-hover | `#1D4ED8` |
| status/success | `#16A34A` |
| status/warning | `#D97706` |
| status/danger | `#DC2626` |

**Dark**
| Token | Hex |
|---|---|
| bg/default | `#0B1220` |
| bg/surface | `#111827` |
| border/default | `#243244` |
| text/default | `#E5E7EB` |
| text/muted | `#9CA3AF` |
| brand/primary | `#60A5FA` |
| brand/primary-hover | `#3B82F6` |
| status/success | `#22C55E` |
| status/warning | `#F59E0B` |
| status/danger | `#F87171` |

### 1.3 CSS variable contract (semantic → CSS vars)
Use CSS variables as the single runtime source of truth.

```css
/* src/styles/tokens.css */
:root[data-theme="light"] {
  --bg-default: #F8FAFC;
  --bg-surface: #FFFFFF;
  --border-default: #E2E8F0;
  --text-default: #0F172A;
  --text-muted: #475569;

  --brand-primary: #2563EB;
  --brand-primary-hover: #1D4ED8;

  --status-success: #16A34A;
  --status-warning: #D97706;
  --status-danger: #DC2626;
}

:root[data-theme="dark"] {
  --bg-default: #0B1220;
  --bg-surface: #111827;
  --border-default: #243244;
  --text-default: #E5E7EB;
  --text-muted: #9CA3AF;

  --brand-primary: #60A5FA;
  --brand-primary-hover: #3B82F6;

  --status-success: #22C55E;
  --status-warning: #F59E0B;
  --status-danger: #F87171;
}
```

### 1.4 Theme switching (Angular, minimal)
Set the theme on the root element (no component logic).

```ts
// src/app/theme/theme.service.ts
import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private key = 'spoker.theme';

  get(): ThemeMode {
    const saved = localStorage.getItem(this.key) as ThemeMode | null;
    return saved ?? 'light';
  }

  set(mode: ThemeMode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(this.key, mode);
  }

  init() {
    this.set(this.get());
  }
}
```

---

## 2) Angular repo layout + naming conventions

### 2.1 Folder structure
```
src/
  styles/
    tokens.css
    foundations.scss        # typography/spacing/radii/elevation maps
    global.scss             # body, container defaults, base resets

  app/
    ui/                     # stateless, reusable primitives
      button/
      input/
      card/
      badge/
      table/
      modal/
      ui.types.ts           # shared UI types/enums
      ui.tokens.scss        # SCSS helpers mapping to CSS vars

    domain/                 # lightly stateful, domain-facing components
      product-tile/
      cart-line-item/

    layouts/
      public-layout/
      auth-layout/
      admin-sidenav/        # optional (admin only)

    pages/
      home/
      products/
      product-detail/
      cart/
      checkout/
      admin-products/
      admin-orders/

    theme/
      theme.service.ts
      theme-toggle.component.ts (optional)

    app.routes.ts
    app.component.ts
```

### 2.2 Rule of thumb (enforced)
- `/ui`: **no API calls**, no router use, no store/services. Pure inputs/outputs.
- `/domain`: may accept domain models + emit events, may contain tiny interaction state (qty stepper).
- `/pages`: orchestration only (routing, services, stores, API, composition).
- `/layouts`: structural chrome only.

---

## 3) Component contracts (TypeScript + DOM slots)

> These contracts are intentionally simple so you can scale into a full design system later.

### 3.1 Shared UI types
```ts
// src/app/ui/ui.types.ts
export type UiSize = 'sm' | 'md' | 'lg';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type CardVariant = 'default' | 'clickable' | 'elevated';

export type ModalSize = 'sm' | 'md' | 'lg';

export type InputState = 'default' | 'focused' | 'error' | 'disabled';
```

---

## 3.2 `<ui-button>`
**Inputs**
- `variant: ButtonVariant = 'primary'`
- `size: UiSize = 'md'`
- `disabled = false`
- `isLoading = false`
- `type: 'button' | 'submit' | 'reset' = 'button'`
- `iconLeft?: string` (icon name/id)
- `iconRight?: string`

**Outputs**
- `clicked: EventEmitter<MouseEvent>` (only when not disabled/loading)

**Content slots**
- default slot for label text

---

## 3.3 `<ui-input>`
Supports text-like inputs + textarea + select via `controlType`.

**Inputs**
- `label?: string`
- `helperText?: string`
- `errorText?: string`
- `placeholder?: string`
- `disabled = false`
- `required = false`
- `controlType: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' = 'text'`
- `options?: Array<{ label: string; value: string }>` (only for select)
- `prefixIcon?: string`
- `suffixIcon?: string`

**Outputs**
- `valueChange: EventEmitter<string | number>`
- `blurred: EventEmitter<void>`
- `focused: EventEmitter<void>`

**Notes**
- Internally should implement `ControlValueAccessor` so pages can use Reactive Forms cleanly.

---

## 3.4 `<ui-card>`
**Inputs**
- `variant: CardVariant = 'default'`
- `title?: string`
- `clickable = false` (alias for variant=clickable is fine)

**Outputs**
- `cardClick: EventEmitter<MouseEvent>` (only when clickable)

**Slots**
- header (optional)
- default content
- footer (optional)

---

## 3.5 `<ui-badge>`
**Inputs**
- `variant: BadgeVariant = 'default'`
- `size: 'sm' | 'md' = 'sm'`
- `text: string`

No outputs.

---

## 3.6 `<ui-table>`
Keep it “admin-grade” but minimal.

**Inputs**
- `columns: Array<{ key: string; label: string; sortable?: boolean; width?: string }>`
- `rows: any[]`
- `rowKey: (row: any) => string`
- `selectedKeys: Set<string>` (for bulk select)
- `sort?: { key: string; direction: 'asc' | 'desc' }`

**Outputs**
- `sortChange: EventEmitter<{ key: string; direction: 'asc' | 'desc' }>`
- `selectionChange: EventEmitter<Set<string>>`
- `rowAction: EventEmitter<{ action: string; row: any }>`
- `rowClick: EventEmitter<any>` (optional)

---

## 3.7 `<ui-modal>`
**Inputs**
- `isOpen: boolean`
- `size: ModalSize = 'md'`
- `title?: string`
- `dismissible = true`

**Outputs**
- `closed: EventEmitter<'backdrop' | 'escape' | 'button'>`
- `confirmed: EventEmitter<void>` (only if you include footer actions)

**Slots**
- default content
- footer actions (optional)

---

## 3.8 Domain Components

### `<domain-product-tile>`
**Inputs**
- `product: { id: string; title: string; priceCents: number; imageUrl?: string; badge?: { variant: BadgeVariant; text: string } }`
- `state?: 'default' | 'out_of_stock' | 'discounted' | 'low_inventory'`

**Outputs**
- `view: EventEmitter<string>` (product id)
- `addToCart: EventEmitter<{ productId: string; qty: number }>` (default qty = 1)

### `<domain-cart-line-item>`
**Inputs**
- `item: { productId: string; title: string; unitPriceCents: number; imageUrl?: string; qty: number }`

**Outputs**
- `qtyChange: EventEmitter<{ productId: string; qty: number }>`
- `remove: EventEmitter<string>` (productId)

---

## 4) SCSS foundations (maps to tokens)

Put spacing/radii/elevation in SCSS maps, but colors stay in CSS vars for theme switching.

```scss
/* src/styles/foundations.scss */
$space: (
  1: 4px,
  2: 8px,
  3: 12px,
  4: 16px,
  5: 24px,
  6: 32px,
  7: 48px
);

$radius: (
  sm: 6px,
  md: 10px,
  lg: 16px
);

$elevation: (
  0: none,
  1: 0 1px 2px rgba(0,0,0,0.08),
  2: 0 12px 30px rgba(0,0,0,0.22)
);
```

---

## 5) Figma artifact
**Theme + architecture diagram (FigJam):**
- https://www.figma.com/online-whiteboard/create-diagram/0068faf7-aa9e-40ce-a723-9a51589b1c23?utm_source=chatgpt&utm_content=edit_in_figjam&oai_id=v1%2FEtw6SBXvEjCnBfZg6wzyV5OmC5rBxcPZjZTeq34MS9Gf4qt1NmUAtD&request_id=5520e36c-dd0f-4ac6-9715-eb1ba24ae51d
