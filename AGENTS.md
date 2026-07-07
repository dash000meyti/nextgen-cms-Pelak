<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nextgen CMS (Pelak)

پلتفرم CMS فارسی (RTL) per-customer — Next.js 16 + SQLite + Drizzle. هر مشتری: یک container + volume `/data/pelak.sqlite`.

## واژگان

| فارسی | فنی | مسیر |
|-------|-----|------|
| پلاک | Pelak | `apps/pelak` |
| استودیو | Studio | `packages/studio` + `/admin` |
| بخش هسته | Core Section | content, members, media, settings |
| ماژول | Feature Module | contentGroup, video, newsletter |
| قرارداد | Contract | `packages/contract` |
| هسته | Core | `packages/core` |
| دادهٔ سایت | Site Data | `packages/site-data` |
| seed | Seed | `packages/seed` |
| DB | pelak.sqlite | `./data/` (dev) · `/data/` (prod) |
| آپلودها | uploads | `./data/uploads/` (dev) · `/data/uploads/` (prod) |

## Monorepo

```
apps/pelak          ← تنها deploy (site + /admin)
packages/contract   ← types, permissions, cms-schema
packages/core       ← DB, migrations, repos
packages/config     ← theme, cache tags
packages/site-data  ← public accessors
packages/studio     ← admin mutations/queries, session
packages/seed       ← first-boot fixtures
docker/             ← image + entrypoint
```

```mermaid
flowchart TB
  Pelak[apps/pelak] --> SiteData[@nextgen-cms/site-data]
  Pelak --> Studio[@nextgen-cms/studio]
  SiteData --> Core[@nextgen-cms/core]
  Studio --> Core
  Core --> Contract[@nextgen-cms/contract]
  SiteData --> Config[@nextgen-cms/config]
  Studio --> Config
  Core --> DB[(pelak.sqlite)]
```

وابستگی acyclic: `contract` → `core` → `config` → `{site-data, studio}` → `apps/pelak`

## قوانین طلایی

- build بدون migrate/seed
- public → `@nextgen-cms/site-data`؛ admin → `@nextgen-cms/studio`
- کامپوننت فقط props — بدون import مستقیم DB/fixture
- migration additive-only — DB canonical: `pelak.sqlite`
- RTL (`lang="fa"`, `dir="rtl"`)، Tailwind v4، بدون UI library خارجی (فعلاً)
- RBAC: `settings.*` / `content.*` / `members.*` / `media.*` / `modules.*` — skill `hokmran-rbac`
- تقویم: `packages/core/src/platform/datetime.ts` — شمسی، `Asia/Tehran`

## Import map

| قدیم (deprecated) | جدید |
|-------------------|------|
| `@/lib/*` | `@nextgen-cms/*` |
| `apps/site`, `apps/studio` | حذف — فقط `apps/pelak` |
| repository مستقیم در صفحات public | `@nextgen-cms/site-data` |

درون app: `@/components/*` مجاز.

## UI (آینده)

```
apps/pelak/components/
  ui/            ← primitives (آینده: packages/ui)
  admin/         ← استودیو
  home|article/  ← سایت عمومی
  layout/        ← shell
```

جزئیات و roadmap: `docs/UI-BOUNDARY.md`

## دستورات

```bash
npm run dev          # apps/pelak
npm run build        # بدون migrate/seed
npm run build:pelak  # deploy
npm run db:setup     # migrate + first-boot seed
npm run db:backup:snapshot        # snapshot کامل (DB + uploads) → tar.gz
npm run db:restore:snapshot -- <file.tar.gz>   # بازیابی از snapshot
npm run ci:check     # lint + build + migrate dry-run
```

## اسناد

| سند | موضوع |
|-----|-------|
| `docs/ARCHITECTURE.md` | معماری، core vs module |
| `docs/AI-GUIDE.md` | task → path برای agentها |
| `docs/STUDIO.md` | ادمین، settings، RBAC |
| `docs/UI-BOUNDARY.md` | ساختار کامپوننت + roadmap UI |
| `docs/CMS-SCHEMA.md` | schema-driven CMS |
| `docs/ONBOARDING.md` | شروع dev |
| `docs/MIGRATION-POLICY.md` | semver + DB |
| `docs/DEPLOYMENT.md` | Docker |

Skills: `hokmran-page` · `hokmran-component` · `hokmran-studio` · `hokmran-rbac` · `hokmran-theme`
