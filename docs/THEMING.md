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
| `contentGroup` | `true` | Show `/content-group` in nav/footer |
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

Defaults: `packages/config/src/theme/defaults.ts`.

## Read path (public)

```
app/layout.tsx
  → getThemeTokens()     [cache tag: theme]
  → getFeatureModules()  [cache tag: site-config]
  → getSiteConfig()      [cache tag: site-config]
  → ThemeTokensProvider
  → applyFeatureModules()
```

Accessors: `packages/site-data/src/get-content.ts`  
CSS mapping: `packages/site-data/src/get-theme-css.ts`

## Write path (admin)

Server actions in `packages/studio/src/admin/config-actions.ts`:

| Action | Invalidates |
|--------|-------------|
| `saveThemeTokens` | `theme` |
| `saveFeatureModules` | `site-config` |
| `saveSiteSettings` | `site-config` + `theme` |

Uses `updateTag` (Next.js 16 Server Actions).

Requires admin session (`getAdminSession`).

## Cache

- Wrapper: `packages/config/src/cache.ts` (`unstable_cache`)
- Tags: `packages/config/src/constants.ts` — `site-config`, `theme`
- No TTL; only tag invalidation via `updateTag` (from Server Actions)
- Never write CSS files to disk

## Extending tokens

1. Add field to `ThemePalette` in `packages/contract/src/types/theme.ts`
2. Add default in `packages/config/src/theme/defaults.ts` and `apps/pelak/app/globals.css`
3. Map to CSS in `packages/site-data/src/get-theme-css.ts` (`PALETTE_TO_CSS`)
4. Additive migration if needed (or update JSON defaults in migration seed row)
5. Wire into `@theme inline` in `globals.css` if Tailwind utility needed

## Migrations & seed

- Migration `0002_theme_tokens` creates table, seeds defaults, adds `feature_modules`
- First-boot seed: `packages/seed/src/fixtures/theme-tokens.ts`
- Existing installs get defaults from migration SQL

## Legacy to current path map

| Legacy path | Current path |
|-------------|--------------|
| `lib/theme/defaults.ts` | `packages/config/src/theme/defaults.ts` |
| `lib/data/get-content.ts` | `packages/site-data/src/get-content.ts` |
| `lib/data/get-theme-css.ts` | `packages/site-data/src/get-theme-css.ts` |
| `lib/admin/config-actions.ts` | `packages/studio/src/admin/config-actions.ts` |
| `lib/platform/cache.ts` | `packages/config/src/cache.ts` |
| `lib/platform/constants.ts` | `packages/config/src/constants.ts` |
| `lib/types/theme.ts` | `packages/contract/src/types/theme.ts` |
