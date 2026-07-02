# راهنمای استقرار (Vendor)

این سند مسیر canonical استقرار `apps/pelak` در حالت single-container را مشخص می‌کند.

## Compose canonical

- فایل canonical: `docker-compose.yml` در ریشه repo
- Dockerfile canonical: `Dockerfile` در ریشه repo (آروان و `docker compose` از همین مسیر build می‌گیرند)
- entrypoint: `docker/docker-entrypoint.sh`
- همه دستورات با فرم زیر اجرا شوند:

```bash
docker compose -f docker-compose.yml <command>
```

> فایل `docker/docker-compose.yml` فقط برای سازگاری نگه داشته شده و مرجع اصلی عملیات نیست.

## پیش‌نیازها

- Docker Engine + Docker Compose v2
- volume پایدار برای `/data`
- تنظیم environmentهای production (حداقل `SESSION_SECRET`)

## Pre-flight checklist (قبل از deploy)

1. `SESSION_SECRET` مقدار امن و بلند داشته باشد.
2. `NEXT_PUBLIC_SITE_URL` با دامنه واقعی تولید یکی باشد.
3. mount پایدار `/data` فعال باشد.
4. از دیتابیس فعلی backup خارج از هاست نیز نگه‌داری شود.
5. روی commit/tag مقصد، `npm run ci:check` پاس شده باشد.

## متغیرهای محیطی

| متغیر | الزامی | توضیح |
|-------|--------|--------|
| `SESSION_SECRET` | بله (prod) | امضای session ادمین |
| `BOOTSTRAP_ADMIN_USERNAME` | فقط first boot | نام کاربری admin اولیه |
| `BOOTSTRAP_ADMIN_PASSWORD` | فقط first boot | رمز admin اولیه |
| `BOOTSTRAP_ADMIN_EMAIL` | اختیاری | ایمیل پروفایل admin اولیه |
| `SEED_MODE` | اختیاری | `auto` \| `seed-if-empty` \| `seed-if-no-platform-meta` \| `never` |
| `NEXT_PUBLIC_SITE_URL` | بله | مبنای sitemap/robots و URL عمومی |
| `DATABASE_URL` | خیر | entrypoint آن را به `file:/data/pelak.sqlite` override می‌کند |

## استقرار اولیه

```bash
docker compose -f docker-compose.yml up -d --build
```

در startup نخست:
1. `/data/backups` و `/data/uploads` ساخته می‌شود.
2. migrate اجرا می‌شود.
3. در first boot، seed اولیه (از جمله admin و `platform_meta`) اجرا می‌شود.
4. سرویس روی پورت 3000 بالا می‌آید.

پس از first boot، رمز admin را فوراً تغییر دهید.

## Upgrade (build-from-source flow)

```bash
# 1) backup دستی داخل کانتینر (پیش از restart)
docker compose -f docker-compose.yml exec pelak \
  node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-db.ts

# 2) rebuild + restart
docker compose -f docker-compose.yml up -d --build

# 3) بررسی health
curl -sSf http://localhost:3000/api/health
```

Startup خودکار در هر restart:
- backup timestamped قبل از migrate (اگر DB موجود باشد)
- migrate additive
- seed فقط در first boot
- اجرای `ensure-platform-meta` برای نصب‌های موجود

## Post-deploy smoke checks

1. `GET /api/health` باید `200` برگرداند.
2. ورود ادمین در `/admin/login` با نام کاربری موفق باشد.
3. یک عملیات نوشتنی ساده در admin (مثلاً بروزرسانی تنظیمات) انجام شود.
4. بارگذاری و دسترسی فایل در `/uploads/...` بررسی شود.
5. مسیرهای public کلیدی (`/`, `/content`, `/content-group`, `/video`) باز شوند.

## Backup retention و بازیابی

- حداقل 7 نسخه روزانه + 4 نسخه هفتگی نگه‌داری شود.
- backupهای داخلی `/data/backups` باید به storage خارجی نیز کپی شوند.

### Rollback / Restore

1. سرویس را متوقف کنید.
2. فایل backup معتبر را روی `/data/pelak.sqlite` برگردانید.
3. سرویس را با image هدف بالا بیاورید.
4. health + login + مسیرهای کلیدی را verify کنید.

```bash
docker compose -f docker-compose.yml down
cp /data/backups/pelak-YYYYMMDD-HHmmss.sqlite /data/pelak.sqlite
docker compose -f docker-compose.yml up -d
```

> rollback schema فقط وقتی ایمن است که backup قبل از migration ناسازگار گرفته شده باشد.

## Secret rotation policy

- `SESSION_SECRET` در بازه‌های منظم (مثلاً هر 90 روز) rotate شود.
- بعد از rotate، ری‌استارت کنترل‌شده انجام و login مجدد بررسی شود.
- credentialهای first-boot (`ADMIN_PASSWORD`) موقت هستند و باید بلافاصله تعویض شوند.

## Health check response

`GET /api/health` → `200`:

```json
{
  "status": "ok",
  "db": "ok",
  "coreVersion": "0.1.0",
  "schemaRevision": "0001_platform_meta"
}
```

`503` به معنی عدم دسترسی DB است.

## توسعه محلی

```bash
cp .env.example .env.local
npm run db:setup
npm run dev
```

`npm run build` به DB نیاز ندارد.

## دستورات مفید

| دستور | کاربرد |
|-------|--------|
| `npm run db:migrate` | اعمال migrations |
| `npm run db:backup` | backup دستی در محیط local |
| `npm run db:restore -- <path/to/file.sqlite>` | بازیابی دیتابیس از فایل sqlite |
| `FIRST_BOOT=1 npm run db:seed` | seed اولیه |
| `npm run db:seed -- --force` | re-seed کامل (خطرناک در prod) |
| `npm run start:prod` | migrate + start (بدون Docker) |
