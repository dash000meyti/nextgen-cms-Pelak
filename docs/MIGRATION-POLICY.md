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
- ❌ حذف ستون/جدول در همان release
- ❌ rename ستون بدون migration bridge

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
