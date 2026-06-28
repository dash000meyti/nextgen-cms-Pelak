# Theming & Platform Config

## Overview

Hokmran theme colors and layout tokens live in SQLite, not on disk. At request time the root layout reads cached tokens and injects CSS custom properties via an inline `<style>` block. `app/globals.css` keeps the same values as fallbacks if the DB read fails.

## Database

### `theme_tokens` (singleton `id = 1`)

| Column | Type | Description |
|--------|------|-------------|
| `light` | JSON | Light-mode `ThemePalette` |
| `dark` | JSON | Dark-mode `ThemePalette` |

### `site_settings.feature_modules`

| Key | Default | Effect |
|-----|---------|--------|
| `issues` | `true` | Show `/issues` in nav/footer |
| `video` | `true` | Show `/video` in nav/footer |
| `newsletter` | `false` | Reserved for future UI |

## Token list (`ThemePalette`)

| TS key | CSS variable | Example (light) |
|--------|--------------|-----------------|
| `paper` | `--paper` | `#ffffff` |
| `surface` | `--surface` | `#faf8f6` |
| `surface2` | `--surface-2` | `#f3f0eb` |
| `ink` | `--ink` | `#14110f` |
| `inkMuted` | `--ink-muted` | `#5c5752` |
| `inkFaint` | `--ink-faint` | `#8a847d` |
| `accent` | `--accent` | `#8b0016` |
| `accentHover` | `--accent-hover` | `#6e0011` |
| `accentSoft` | `--accent-soft` | `#f4e8ea` |
| `rule` | `--rule` | `#e6e2dd` |
| `ruleStrong` | `--rule-strong` | `#d4cec6` |
| `contentMax` | `--content-max` | `42rem` |
| `wideMax` | `--wide-max` | `76rem` |
| `radius` | `--radius` | `6px` |

Defaults: `lib/theme/defaults.ts`.

## Read path (public)

```
app/layout.tsx
  → getThemeTokens()     [cache tag: theme]
  → getFeatureModules()  [cache tag: site-config]
  → getSiteConfig()      [cache tag: site-config]
  → ThemeTokensProvider
  → applyFeatureModules()
```

Accessors: `lib/data/get-content.ts`  
CSS mapping: `lib/data/get-theme-css.ts`

## Write path (admin)

Server actions in `lib/admin/config-actions.ts`:

| Action | Invalidates |
|--------|-------------|
| `saveThemeTokens` | `theme` |
| `saveFeatureModules` | `site-config` |
| `saveSiteSettings` | `site-config` + `theme` |

Uses `updateTag` (Next.js 16 Server Actions).

Requires admin session (`getAdminSession`).

## Cache

- Wrapper: `lib/platform/cache.ts` (`unstable_cache`)
- Tags: `lib/platform/constants.ts` — `site-config`, `theme`
- No TTL; only tag invalidation via `updateTag` (from Server Actions)
- Never write CSS files to disk

## Extending tokens

1. Add field to `ThemePalette` in `lib/types/theme.ts`
2. Add default in `lib/theme/defaults.ts` and `app/globals.css`
3. Map to CSS in `lib/data/get-theme-css.ts` (`PALETTE_TO_CSS`)
4. Additive migration if needed (or update JSON defaults in migration seed row)
5. Wire into `@theme inline` in `globals.css` if Tailwind utility needed

## Migrations & seed

- Migration `0002_theme_tokens` creates table, seeds defaults, adds `feature_modules`
- First-boot seed: `packages/seed/src/fixtures/theme-tokens.ts`
- Existing installs get defaults from migration SQL
