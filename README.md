# حکمران (Nextgen CMS / Pelak)

پلتفرم CMS فارسی (RTL) با Next.js 16، SQLite و Drizzle در ساختار monorepo.  
تنها اپ قابل استقرار `apps/pelak` است (سایت عمومی + استودیو در `/admin`).

## شروع سریع

```bash
npm install
npm run db:setup
npm run dev
```

- وب‌سایت: `http://localhost:3134`
- ادمین: `http://localhost:3134/admin/login`

## دستورات اصلی

```bash
npm run dev
npm run build
npm run build:pelak
npm run ci:check
npm run start:prod
npm run db:backup:snapshot        # snapshot کامل (DB + uploads) → data/backups/pelak-snapshot-*.tar.gz
npm run db:restore:snapshot -- <file.tar.gz>   # بازیابی از snapshot کامل
```

## معماری مخزن

```text
apps/pelak        اپ deploy (site + /admin)
packages/contract تایپ‌ها، مجوزها، schema contract
packages/core     DB, migrations, repos, platform paths
packages/config   theme defaults + cache tags
packages/site-data accessorهای public
packages/studio   query/mutationهای admin + session
packages/seed     first-boot seed
docker/           Dockerfile + entrypoint
docs/             مستندات فنی و عملیاتی
```

## مسیرهای کلیدی

- Public: `/`, `/content`, `/content/[slug]`, `/members/[slug]`, `/topics/[slug]`, `/content-group`, `/video`, `/about`, `/contact`
- Admin: `/admin/login`, `/admin`, `/admin/content`, `/admin/members`, `/admin/media`, `/admin/settings`
- Aliasهای قدیمی مثل `/articles/*` و `/authors/*` با redirect دائمی به مسیرهای canonical هدایت می‌شوند.

## اصول اجرایی

- public data فقط از `@nextgen-cms/site-data`
- admin mutation/query فقط از `@nextgen-cms/studio`
- migrationها additive-only و دیتابیس canonical: `pelak.sqlite`
- build نباید migrate/seed اجرا کند

## استقرار Docker

- تصویر production در `Dockerfile` (ریشه repo)
- entrypoint در `docker/docker-entrypoint.sh`
- volume داده: `/data` (شامل `/data/pelak.sqlite` و `/data/uploads`)
- پشتیبان کامل (DB + رسانه‌ها) از `/admin/settings/database` یا `npm run db:backup:snapshot`

راهنمای کامل:
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/MIGRATION-POLICY.md](docs/MIGRATION-POLICY.md)
- [docs/ONBOARDING.md](docs/ONBOARDING.md)
