# راهنمای استقرار (Vendor)

این سند برای تیم استقرار است که image جدید را روی volume موجود مشتری deploy می‌کند.

## پیش‌نیازها

- Docker / Docker Compose
- Volume پایدار برای `/data`
- متغیرهای محیطی (حداقل `SESSION_SECRET`)

## استقرار اولیه

```bash
docker compose up -d --build
```

اولین startup:
1. پوشهٔ `/data/backups` ساخته می‌شود
2. migrations اعمال می‌شود
3. seed اولیه (محتوا + admin + `platform_meta`)
4. Next.js روی پورت 3000

پس از first boot، رمز admin را از `ADMIN_PASSWORD` عوض کنید.

## متغیرهای محیطی

| متغیر | الزامی | توضیح |
|-------|--------|--------|
| `SESSION_SECRET` | بله (prod) | امضای session ادمین |
| `ADMIN_EMAIL` | first boot | ایمیل admin (پیش‌فرض در seed) |
| `ADMIN_PASSWORD` | first boot | رمز admin اولیه |
| `NEXT_PUBLIC_SITE_URL` | توصیه‌شده | sitemap و robots |
| `DATABASE_URL` | خیر | entrypoint همیشه `file:/data/pelak.sqlite` set می‌کند |

## Upgrade به tag جدید

```bash
# 1. (اختیاری) backup دستی
docker compose exec pelak npm run db:backup

# 2. pull/build image جدید
docker compose pull   # یا: docker build -f docker/Dockerfile -t nextgen-cms:local .
docker compose up -d

# 3. بررسی health
curl -s http://localhost:3000/api/health
```

Startup خودکار:
- backup timestamped قبل از migrate
- migrate (بدون seed، مگر first boot)
- `ensure-platform-meta` برای نصب‌های قدیمی

## Rollback

1. container را متوقف کنید
2. آخرین backup را از `/data/backups/` روی `/data/pelak.sqlite` کپی کنید
3. image قبلی را اجرا کنید

```bash
docker compose down
cp /data/backups/pelak-YYYYMMDD-HHmmss.sqlite /data/pelak.sqlite
docker compose up -d
# با image/tag قبلی
```

**توجه:** rollback schema فقط وقتی ایمن است که migration جدید اجرا نشده یا backup قبل از migrate گرفته شده باشد.

## Health check

`GET /api/health` → `200`:

```json
{
  "status": "ok",
  "db": "ok",
  "coreVersion": "0.1.0",
  "schemaRevision": "0001_platform_meta"
}
```

`503` یعنی DB در دسترس نیست.

## توسعه محلی

```bash
cp .env.example .env.local
npm run db:setup
npm run dev
```

`npm run build` به DB نیاز ندارد (صفحات `force-dynamic`).

## دستورات مفید

| دستور | کاربرد |
|-------|--------|
| `npm run db:migrate` | اعمال migrations |
| `npm run db:backup` | backup دستی |
| `FIRST_BOOT=1 npm run db:seed` | seed اولیه |
| `npm run db:seed -- --force` | re-seed کامل (خطرناک در prod) |
| `npm run start:prod` | migrate + start (بدون Docker) |
