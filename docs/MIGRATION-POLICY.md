# Migration Policy — Nextgen CMS

## Semantic Versioning

نسخه در `packages/core/package.json` = `CORE_VERSION` در `platform_meta`.

| Bump | چه زمانی |
|------|----------|
| MAJOR | breaking API package یا migration غیرقابل برگشت |
| MINOR | feature + migration additive |
| PATCH | bugfix بدون تغییر schema |

Release: `npm run release [patch|minor|major]` + به‌روز `CHANGELOG.md`

## Database Migrations

### قوانین additive-only

- ✅ افزودن جدول، ستون nullable، index
- ✅ مقدار پیش‌فرض برای ستون جدید required
- ✅ الگوی امن تکاملی: add column → backfill → add index/constraint
- ❌ حذف ستون/جدول در همان release
- ❌ rename ستون بدون migration bridge

### defaults registry و backfill

- مرجع پیش‌فرض‌های runtime در `packages/config/src/theme/defaults.ts` (کلید `DEFAULTS_REGISTRY`) نگه‌داری می‌شود.
- هر فیلد/تنظیم جدید باید هم در migration SQL (برای دیتای قدیمی) و هم در normalizer runtime (برای ورودی جدید/ناقص) پوشش داده شود.
- برای permissionهای جدید، migration backfill روی `role_permissions` اضافه کنید تا نصب‌های قدیمی با release جدید همگام بمانند.
  - مجوز مخصوص یک نقش: `0015_settings_database_permission.sql` (فقط `super_admin`)
  - backfill کامل super_admin + gapهای نقش‌های دیگر: `0016_rbac_permission_backfill.sql`

### workflow

1. ویرایش `packages/core/src/db/schema/`
2. `npm run db:generate`
3. بررسی SQL در `packages/core/drizzle/migrations/`
4. commit migration + کد

### production

- migrate **هر startup** — `docker/docker-entrypoint.sh`
- seed **فقط first-boot**
- backup خودکار قبل از migrate

## Package API

- breaking change در `@nextgen-cms/*` → MAJOR bump
- export جدید → MINOR
- internal refactor بدون تغییر public export → PATCH

## Deprecation Shims (`lib/`)

یک release cycle:

```
lib/db/index.ts → @nextgen-cms/core/db
lib/data/*      → @nextgen-cms/site-data/*
```

پس از release بعدی: حذف shims + MAJOR اگر لازم.

## Rollback

1. deploy image tag قبلی
2. volume دست نخورده — schema جدیدتر ممکن است با image قدیمی ناسازگار باشد
3. restore از `/data/backups/` در صورت نیاز
