# Theming Guide

Spoker is built with a CSS custom property token system that makes full visual reskins possible by creating a single theme file. No component code needs to change.

---

## How It Works

All design values (colors, fonts, spacing, radius, shadows) are defined as CSS custom properties in:

```
frontend/src/app/styles/_tokens.scss
```

Every component references tokens via `var(--token-name)` rather than hardcoded values. To change the appearance of the entire app, you only need to override the tokens you care about.

The active theme is imported in `frontend/src/styles.scss`:

```scss
@use 'app/styles/tokens';
@use 'app/styles/themes/default';  // ← swap this line for a client theme
```

---

## Creating a Client Theme

### 1. Copy the default theme

```bash
cp frontend/src/app/styles/themes/_default.scss \
   frontend/src/app/styles/themes/_plantshop.scss
```

### 2. Override tokens

Open your new theme file and add a `:root` block with any tokens you want to change. You only need to include the ones that differ — everything else falls back to `_tokens.scss`.

```scss
// frontend/src/app/styles/themes/_plantshop.scss

:root {
  // Brand
  --color-primary:          #2e7d32;   // forest green
  --color-primary-hover:    #1b5e20;
  --color-primary-disabled: #a5d6a7;
  --color-accent:           #ff6f00;   // amber
  --color-accent-hover:     #e65100;

  // Nav
  --color-nav-bg:           #1b2a1b;   // dark green
  --color-nav-border:       #2e4a2e;

  // Typography
  --font-family:            'Georgia', serif;
}
```

### 3. Activate the theme

In `frontend/src/styles.scss`, swap the theme import:

```scss
@use 'app/styles/tokens';
@use 'app/styles/themes/plantshop';  // ← your new theme
```

### 4. Rebuild

```bash
npm run docker:dev   # or ng build for a production build
```

---

## Available Tokens

All tokens are defined in `frontend/src/app/styles/_tokens.scss`. Here is a reference:

### Brand
| Token | Default | Description |
|---|---|---|
| `--color-primary` | `#007bff` | Primary button and link color |
| `--color-primary-hover` | `#0056b3` | Primary hover state |
| `--color-primary-disabled` | `#9bbcf4` | Disabled primary button |
| `--color-accent` | `#e67e22` | Demo banner, role indicator, highlights |
| `--color-accent-hover` | `#d35400` | Accent hover state |

### Surface & Background
| Token | Default | Description |
|---|---|---|
| `--color-bg` | `#2f2f2f` | App shell background |
| `--color-surface` | `#ffffff` | Cards, modals, popovers |
| `--color-surface-subtle` | `#f5f5f5` | Input backgrounds, muted panels |
| `--color-overlay` | `rgba(0,0,0,0.45)` | Modal backdrop |

### Nav
| Token | Default | Description |
|---|---|---|
| `--color-nav-bg` | `#1a1a1a` | Navbar background |
| `--color-nav-border` | `#333333` | Navbar bottom border |
| `--color-nav-text` | `#aaaaaa` | Nav link color |
| `--color-nav-text-active` | `#ffffff` | Active/hover nav link |

### Text
| Token | Default | Description |
|---|---|---|
| `--color-text` | `#333333` | Default body text on light surfaces |
| `--color-text-muted` | `#666666` | Secondary text |
| `--color-text-subtle` | `#999999` | Placeholder, labels |
| `--color-text-inverted` | `#ffffff` | Text on dark/colored backgrounds |

### Semantic
| Token | Default | Description |
|---|---|---|
| `--color-success` | `#28a745` | Price, savings value |
| `--color-success-bg` | `#d4edda` | Savings badge background |
| `--color-danger` | `#dc3545` | Error states, delete button |
| `--color-danger-bg` | `#fde8e8` | Error message background |

### Typography
| Token | Default | Description |
|---|---|---|
| `--font-family` | `Verdana, Geneva, Tahoma, sans-serif` | Global font stack |
| `--font-size-xs` | `1.1rem` | Fine print, chips |
| `--font-size-sm` | `1.2rem` | Labels, captions |
| `--font-size-base` | `1.4rem` | Default body text |
| `--font-size-md` | `1.6rem` | Inputs, prominent body |
| `--font-size-lg` | `2.0rem` | Nav brand, subheadings |
| `--font-size-xl` | `2.4rem` | Card headings |
| `--font-size-2xl` | `2.6rem` | Page headings |

### Spacing
| Token | Value |
|---|---|
| `--space-1` | `0.4rem` |
| `--space-2` | `0.8rem` |
| `--space-3` | `1.2rem` |
| `--space-4` | `1.6rem` |
| `--space-5` | `2.0rem` |
| `--space-6` | `2.4rem` |
| `--space-8` | `3.2rem` |
| `--space-10` | `4.0rem` |

### Border Radius
| Token | Default | Description |
|---|---|---|
| `--radius-sm` | `0.4rem` | Inputs, small elements |
| `--radius-md` | `0.8rem` | Buttons, cards |
| `--radius-lg` | `1.2rem` | Modals, large cards |
| `--radius-pill` | `2rem` | Chips, badges |

### Shadow
| Token | Description |
|---|---|
| `--shadow-card` | Product card hover shadow |
| `--shadow-modal` | Modal/dialog shadow |
| `--shadow-popover` | Popover shadow |
| `--shadow-chip` | Demo chip shadow |

---

## Tips

- **Minimal override** — only override what changes. A monochrome shop might only need to change `--color-primary`, `--color-accent`, and `--color-nav-bg`.
- **Dark mode** — override `--color-bg`, `--color-surface`, `--color-text`, and `--color-nav-bg` to go dark.
- **Fonts** — set `--font-family` to any system or web font stack. For Google Fonts, add the `<link>` tag to `index.html` first.
- **Per-deployment** — each client deployment has its own theme file. The base `_tokens.scss` and all components stay untouched.
