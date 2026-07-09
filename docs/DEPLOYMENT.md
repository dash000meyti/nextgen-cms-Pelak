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

> entrypoint در `docker/docker-entrypoint.sh` است.

## پیش‌نیازها

- Docker Engine + Docker Compose v2
- volume پایدار برای `/data`
- تنظیم environmentهای production (حداقل `SESSION_SECRET`)

## Pre-flight checklist (قبل از deploy)

1. `SESSION_SECRET` مقدار امن و بلند داشته باشد.
2. `NEXT_PUBLIC_SITE_URL` با دامنه واقعی تولید یکی باشد.
3. mount پایدار `/data` فعال باشد.
4. از دیتابیس و uploads فعلی snapshot کامل خارج از هاست نیز نگه‌داری شود.
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
| `SNAPSHOT_BEFORE_MIGRATE` | خیر | `1` = قبل از migrate یک snapshot کامل (DB + uploads) گرفته می‌شود. پیش‌فرض: فقط بکاپ DB |
| `SNAPSHOT_MAX_BYTES` | خیر | حداکثر حجم آرشیو آپلودی در `/api/admin/database/import-snapshot` (پیش‌فرض: بدون محدودیت) |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | خیر | مسیر Chromium برای تولید PDF. در Docker به `/usr/bin/chromium` (Chromium نصب‌شده با apt) تنظیم شده است. |

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
  node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-snapshot.ts

# 2) rebuild + restart
docker compose -f docker-compose.yml up -d --build

# 3) بررسی health
curl -sSf http://localhost:3000/api/health
```

Startup خودکار در هر restart:
- backup timestamped قبل از migrate (اگر DB موجود باشد) — به‌صورت پیش‌فرض فقط DB؛ با `SNAPSHOT_BEFORE_MIGRATE=1` یک snapshot کامل (DB + uploads) گرفته می‌شود
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

دو نوع پشتیبان وجود دارد:

| نوع | شامل | فرمت | دستور/مسیر |
|------|-------|-------|------------|
| **سریع (DB-only)** | فقط `pelak.sqlite` | فایل sqlite خام | `npm run db:backup` / `db:restore`، `/api/admin/database/export` |
| **کامل (snapshot)** | `pelak.sqlite` + `uploads/` + `manifest.json` | `tar.gz` | `npm run db:backup:snapshot` / `db:restore:snapshot`، `/api/admin/database/export-snapshot` |

> ریستور DB بدون `uploads/` هماهنگ باعث شکسته شدن همهٔ URLهای `/uploads/...` در سایت می‌شود. برای Disaster Recovery همیشه از snapshot کامل استفاده کنید.

- حداقل 7 نسخه روزانه + 4 نسخه هفتگی نگه‌داری شود (برای هر دو نوع).
- backupهای داخلی `/data/backups` (شامل `pelak-*.sqlite`، `pelak-snapshot-*.tar.gz` و `uploads-*/`) باید به storage خارجی نیز کپی شوند.

### ساخت snapshot کامل (درون container)

```bash
docker compose -f docker-compose.yml exec pelak \
  node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-snapshot.ts
# خروجی: /data/backups/pelak-snapshot-ISO.tar.gz
```

همچنین از رابط ادمین: `/admin/settings/database` → «دانلود پشتیبان کامل».

### بازیابی از snapshot کامل

```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml run --rm \
  pelak node ./node_modules/tsx/dist/cli.mjs \
  packages/core/scripts/restore-snapshot.ts /data/backups/pelak-snapshot-ISO.tar.gz
docker compose -f docker-compose.yml up -d
```

ریستور قبل از جایگزینی، یک نسخه پشتیبان از DB فعلی (`pelak-*.sqlite`) و uploads فعلی (`uploads-*/`) در `/data/backups` می‌گیرد و در صورت خطا rollback می‌کند.

> ساختار آرشیو: `manifest.json` عمداً **اولین** ورودی آرشیو است (metadata-first) تا حتی در انتقال ناقص زودتر اعتبارسنجی شود. آرشیو باید یک `tar.gz` باشد که `manifest.json`، `pelak.sqlite` و `uploads/` را در ریشه دارد. اگر آرشیو را روی macOS باز کرده و دوباره فشرده کرده‌اید (مثلاً با Archive Utility)، ممکن است همه‌چیز داخل یک پوشهٔ wrapper قرار گیرد؛ ریستور این حالت را هم پشتیبانی می‌کند، ولی بهتر است فایل دانلودشده را بدون باز/فشرده‌سازی مجدد مستقیماً بازیابی کنید.

#### خطای «آرشیو شامل manifest.json نیست»

- فایل را دستکاری/باز-و-بسته نکنید؛ همان `tar.gz` دانلودشده را بازیابی کنید.
- صحت فایل را بررسی کنید: `tar -tzf <file.tar.gz> | head` باید `manifest.json` را نشان دهد.
- اگر از رابط وب روی هاست جدید ریستور می‌کنید و یک reverse proxy (nginx) در مسیر است، محدودیت حجم بدنه را افزایش دهید (`client_max_body_size`) تا آپلود قطع نشود؛ آپلود قطع‌شده باعث ناقص‌ماندن آرشیو می‌شود.

### Rollback / Restore (DB-only، سریع)

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

### Disaster recovery / مهاجرت به هاست جدید

1. آخرین snapshot کامل (`pelak-snapshot-*.tar.gz`) را از backup خارجی بازیابی کنید.
2. روی هاست جدید: container را با volume `/data` خالی بالا بیاورید (first boot را رها کنید).
3. سرویس را متوقف کنید و محتوای آرشیو را در `/data` استخراج کنید:
   ```bash
   tar -xzf pelak-snapshot-ISO.tar.gz -C /data
   # اکنون /data/pelak.sqlite و /data/uploads/ در جای خود هستند
   ```
4. سرویس را بالا بیاورید (`SNAPSHOT_BEFORE_MIGRATE` خاموش کافی است؛ migrations additive روی همان schema اعمال می‌شوند).
5. smoke checks (`/api/health`، `/uploads/...`، مسیرهای public) را verify کنید.

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

## Docker image

- Base image: `node:22-bookworm-slim` (Debian) — برای پایداری build روی هاست‌هایی که DNS به mirrorهای Alpine (`dl-cdn.alpinelinux.org`) مشکل دارد.
- native modules (`better-sqlite3`) در همان libc (glibc) کامپایل و اجرا می‌شوند.
- PDF: Chromium از مخزن apt دبیان نصب می‌شود (`apt-get install chromium`) و `playwright-core` از طریق `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` به آن اشاره می‌کند. **از دانلود bundle مرورگر Playwright استفاده نمی‌کنیم** چون هاست build (ایران) از `cdn.playwright.dev` (CDN گوگل Chrome-for-Testing) با خطای 403 «not available in your location» مسدود است. apt به‌طور خودکار وابستگی‌های سیستمی Chromium را هم نصب می‌کند.
- runtime dirهای Chromium برای user غیر root باید writable باشند (`HOME`, `XDG_CONFIG_HOME`, `XDG_CACHE_HOME`).

### خطای Chromium/Crashpad (PDF)

اگر خطایی مشابه `Chromium launch failed for PDF generation` یا `chrome_crashpad_handler --database is required` دیدید:

1. container را rebuild کنید: `docker compose -f docker-compose.yml up -d --build` (نصب browser باید بدون cache انجام شود تا نسخهٔ درست دانلود شود).
2. اگر خطا `Executable doesn't exist at /ms-playwright/chromium_headless_shell-<rev>/...` بود، revision نصب‌شده با نسخهٔ `playwright-core` هماهنگ نیست. مطمئن شوید Dockerfile نسخه را از `playwright-core` استخراج می‌کند و آن را hardcode نکرده. بعد از هر `npm update` برای `playwright-core`، rebuild لازم است.
3. در لاگ startup دنبال `Chromium verification OK` بگردید؛ اگر `WARNING` دیدید، `PLAYWRIGHT_BROWSERS_PATH` و دسترسی `/ms-playwright` را بررسی کنید.
4. برای override دستی: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` را روی binary واقعی Chromium تنظیم کنید.
5. writable بودن مسیرهای `HOME/.config` و `HOME/.cache` را بررسی کنید.

## محدودیت حجم آپلود (Server Actions)

آپلود مدیا از Server Action روی مسیرهای `/admin/*` انجام می‌شود. در `apps/pelak/next.config.ts`:

```ts
experimental: {
  proxyClientMaxBodySize: "30mb",  // باید ≥ maxPdfBytes تنظیمات مدیا
  serverActions: { bodySizeLimit: "30mb" },
}
```

اگر `maxPdfBytes` در `/admin/media?tab=settings` افزایش یابد، هر دو مقدار config را هم بالاتر ببرید. جزئیات: `docs/SEO.md`.

## دستورات مفید

| دستور | کاربرد |
|-------|--------|
| `npm run db:migrate` | اعمال migrations |
| `npm run db:backup` | backup دستی در محیط local (فقط DB) |
| `npm run db:restore -- <path/to/file.sqlite>` | بازیابی دیتابیس از فایل sqlite |
| `npm run db:backup:snapshot` | snapshot کامل (DB + uploads) به `data/backups/pelak-snapshot-*.tar.gz` |
| `npm run db:restore:snapshot -- <path/to/file.tar.gz>` | بازیابی از snapshot کامل |
| `FIRST_BOOT=1 npm run db:seed` | seed اولیه |
| `npm run db:seed -- --force` | re-seed کامل (خطرناک در prod) |
| `npm run start:prod` | migrate + start (بدون Docker) |
