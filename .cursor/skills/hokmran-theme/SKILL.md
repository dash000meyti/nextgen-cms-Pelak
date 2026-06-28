---
name: hokmran-theme
description: راهنمای تغییر theme tokens و feature flags در پلتفرم Nextgen CMS
---

# Theme & Config

## خواندن (public)

- `getThemeTokens()`, `getFeatureModules()`, `getSiteConfig()`
- از `@nextgen-cms/site-data/get-content` — cached با tags در `@nextgen-cms/config`

## نوشتن (admin)

از `@nextgen-cms/studio/admin/config-actions`

## تغییر رنگ برند

1. `packages/config/src/theme/defaults.ts`
2. `apps/pelak/app/globals.css` (fallback)
3. admin یا seed برای DB

## token جدید

1. `packages/contract/src/types/theme.ts`
2. `packages/config/src/theme/defaults.ts` + globals.css
3. `packages/site-data/src/get-theme-css.ts`

جزئیات: `docs/THEMING.md`

## اعتبارسنجی

`npm run build` و `npx biome check`
