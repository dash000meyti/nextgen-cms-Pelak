# راهنمای Agent — Nextgen CMS

> **قبل از هر تغییر بخوان:** [`AGENTS.md`](../AGENTS.md)

## task → path

| می‌خواهم… | برو به | skill/rule |
|-----------|--------|------------|
| صفحه public | `apps/pelak/app/` | `hokmran-page` |
| کامپوننت UI | `apps/pelak/components/` | `hokmran-component` · `docs/UI-BOUNDARY.md` |
| داده public | `packages/site-data/src/get-content.ts` | `data-layer.mdc` |
| mutation admin | `packages/studio/src/cms/mutations/` | `admin-studio.mdc` · `hokmran-studio` |
| query admin | `packages/studio/src/cms/queries/` | `hokmran-studio` |
| schema DB | `packages/core/src/db/schema/` | `data-layer.mdc` |
| type دامنه | `packages/contract/src/types/` | `monorepo.mdc` |
| CMS field defs | `packages/contract/src/cms-schema/` | `hokmran-studio` · `docs/CMS-SCHEMA.md` |
| مجوز RBAC | `packages/contract/src/permissions.ts` | `hokmran-rbac` · `docs/STUDIO.md` |
| theme tokens | `packages/config/src/theme/` | `hokmran-theme` · `styling.mdc` |
| Docker/startup | `docker/` | `platform-deployment.mdc` · `docs/DEPLOYMENT.md` |
| seed/fixture | `packages/seed/src/` | `data-layer.mdc` |
| migration | `packages/core/drizzle/migrations/` | `docs/MIGRATION-POLICY.md` |

## Skills

| skill | کاربرد |
|-------|--------|
| `hokmran-page` | صفحهٔ جدید در `apps/pelak/app/` |
| `hokmran-component` | کامپوننت در `components/ui\|admin\|home\|article\|layout` |
| `hokmran-studio` | document type، settings، mutations |
| `hokmran-rbac` | نقش‌ها، `settings.*`، `modules.*` |
| `hokmran-theme` | theme tokens، feature flags |

## دست نزنید

- `build` بدون migrate/seed
- `DATABASE_URL` production = `file:/data/pelak.sqlite`
- `serverExternalPackages: ['better-sqlite3']`
- volume `/data` در image

## اعتبارسنجی

```bash
npm run ci:check
```

commit فقط با درخواست صریح کاربر.
