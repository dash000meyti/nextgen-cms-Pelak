# Onboarding — توسعه‌دهنده جدید

## پیش‌نیاز

- Node.js 22+
- npm 10+
- macOS/Linux (یا WSL)

## راه‌اندازی

```bash
git clone <repo>
cd nextgen-cms
npm install
npm run db:setup && npm run dev   # http://localhost:3134
```

Admin: `/admin/login` — credentials از seed یا `.env.local`

## Mental model (فارسی)

```
پلاک (apps/pelak)
├── سایت عمومی — صفحات در app/، کامپوننت در components/home|article/
└── استودیو (/admin) — mutations در packages/studio، UI در components/admin/

بخش هسته: محتوا · اعضا · مدیا · تنظیمات
ماژول: گروه‌های محتوا · ویدیو · خبرنامه

داده public ← packages/site-data
داده admin  ← packages/studio
DB          ← packages/core (pelak.sqlite)
```

## ساختار repo

```
apps/pelak/     تنها اپ — site + /admin
packages/       منطق مشترک
docs/           مستندات
docker/         production image
```

## اولین PR — چک‌لیست

1. تغییر در package درست (`@nextgen-cms/*` — نه `@/lib/*`)
2. `npm run ci:check`
3. اگر schema عوض شد: `npm run db:generate` در `packages/core`
4. migration additive-only — `docs/MIGRATION-POLICY.md`

## کجا چه چیزی بنویسم؟

| کار | مسیر |
|-----|------|
| صفحه public | `apps/pelak/app/` |
| کامپوننت | `apps/pelak/components/` — `docs/UI-BOUNDARY.md` |
| mutation | `packages/studio/src/cms/mutations/` |
| accessor public | `packages/site-data/src/get-content.ts` |
| جدول DB | `packages/core/src/db/schema/` |
| type دامنه | `packages/contract/src/types/` |

## Docker

```bash
docker compose build
docker compose up
```

## سوالات

- معماری: `docs/ARCHITECTURE.md`
- AI agents: `docs/AI-GUIDE.md` + `AGENTS.md`
- Studio: `docs/STUDIO.md`
