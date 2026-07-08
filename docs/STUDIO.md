# Studio CMS — حکمران

استودیوی داخلی (schema-driven) برای مدیریت محتوا روی SQLite. مسیر پایه: `/admin`.

## بخش‌های اصلی ادمین

| بخش | مسیر | مجوز نمونه |
|------|------|------------|
| داشبورد | `/admin` | هر عضو واردشده |
| محتوا | `/admin/content` | `content.*` |
| اعضا | `/admin/members` | `members.*` |
| مدیا | `/admin/media` | `media.*` |
| پیام‌ها | `/admin/messages` | `messages.view` |
| تنظیمات | `/admin/settings/*` | `settings.*` |

## پیام‌ها (`/admin/messages`)

صندوق ورودی فرم‌های عمومی (تماس، نظرسنجی و فرم‌های آینده). ارسال‌ها در جدول `messages` ذخیره می‌شوند (یک رکورد با `form` (نوع فرم)، `status`، و `payload` (JSON فیلدهای خاص هر فرم)).

| مسیر | نقش |
|------|-----|
| `/admin/messages` | لیست با فیلتر وضعیت/form — `messages.view` |
| `/admin/messages/[id]` | جزئیات + تغییر وضعیت + حذف — `messages.view` (+ `messages.edit`/`messages.delete`) |

وضعیت‌ها: `unread` (خوانده‌نشده) · `reviewed` (بررسی‌شده) · `pending_followup` (در انتظار پیگیری).

| عمل | مجوز |
|-----|------|
| مشاهدهٔ لیست/جزئیات | `messages.view` |
| تغییر وضعیت | `messages.edit` |
| حذف | `messages.delete` |

### تنظیمات پیام‌ها

تب «پیام‌ها» در هاب تنظیمات (`/admin/settings/messages`) با مجوز `settings.messages`: ویرایش فهرست راه‌های ارتباطی (`contactMethods`: زوج‌های عنوان/مقدار) که در صفحهٔ `/contact` (بخش «راه‌های دیگر») نمایش داده می‌شوند.

## تنظیمات (`/admin/settings`)

هاب **۷ تب** مجوزمحور — تعریف در `packages/studio/src/admin/settings-tabs.ts`:

| تب | مسیر | مجوز |
|----|------|------|
| اطلاعات شخصی | `/admin/settings/personal` | `settings.personal` |
| سایت | `/admin/settings/site` | `settings.site` |
| رنگ‌ها | `/admin/settings/theme` | `settings.theme` |
| نقش‌ها | `/admin/settings/roles` | `settings.roles` |
| ماژول‌ها | `/admin/settings/modules` | `settings.modules` |
| پیام‌ها | `/admin/settings/messages` | `settings.messages` |
| پایگاه داده | `/admin/settings/database` | `settings.database` |

`/admin/settings` به اولین تب مجاز redirect می‌شود.

### تنظیمات بخش‌ها (خارج از هاب)

| بخش | مسیر | مجوز |
|-----|------|------|
| محتوا | `/admin/content/settings/content` | `settings.content` |
| موضوعات (تب) | `/admin/content/settings/topics` | `settings.content` |
| اعضا | `/admin/members/settings` | `settings.members` |
| مدیا | تب «تنظیمات» در `/admin/media` | `settings.media` |
| گروه محتوا | `/admin/content-group/settings` | `modules.contentGroup.edit` |
| ویدیو | `/admin/videos/settings` | `modules.video.edit` |

تنظیمات محتوا **۲ تب** دارد (`packages/studio/src/admin/content-settings-tabs.ts`): «محتوا» و «موضوعات». `/admin/content/settings` به تب محتوا redirect می‌شود. CRUD موضوع (`/admin/content/topics/new`, `.../edit`) جدا از تب‌هاست.

مسیرهای قدیم (`/admin/settings/content`, `/admin/settings/topics`, …) → redirect.

## مسیرهای دیگر

| مسیر | نقش |
|------|-----|
| `/admin/content-group` | CRUD گروه‌های محتوا — `modules.contentGroup.*` |
| `/admin/videos` | CRUD ویدیوها — `modules.video.*` |

## لایهٔ CMS (monorepo)

```
packages/contract/src/cms-schema/   — تعریف document types
packages/studio/src/cms/validation/ — اعتبارسنجی
packages/studio/src/cms/queries/    — خواندن admin
packages/studio/src/cms/mutations/  — Server Actions
packages/core/src/db/repositories/ — نوشتن DB
```

**مرزها:**
- Public فقط `@nextgen-cms/site-data`
- Studio هرگز `components/home/` یا `components/article/` import نکند

## RBAC

- مجوزها: `packages/contract/src/permissions.ts` — `resource.action` (مثلاً `settings.roles`)
- نقش‌ها: جدول `roles` + `role_permissions`؛ نقش سیستمی (`is_system`) فقط مجوزها قابل ویرایش
- Session: `getMemberSession()` → `permissions[]`
- Guard: `requirePermission()` در صفحات؛ `requirePermissionMutation()` در mutations
- skill: `.cursor/skills/hokmran-rbac/SKILL.md`

### لایه‌های مجوز

| لایه | مثال |
|------|------|
| هسته | `content.publish`, `members.edit`, `media.upload`, `messages.view` |
| تنظیمات | `settings.content`, `settings.modules`, `settings.messages`, … |
| ماژول | `modules.contentGroup.view`, `modules.video.create`, `modules.newsletter.manage` |

### مجوزهای ماژول

| ماژول | مجوزها | مسیر ادمین |
|-------|--------|------------|
| گروه‌های محتوا (`contentGroup`) | `view`, `create`, `edit`, `delete` | `/admin/content-group` |
| ویدیو (`video`) | `view`, `create`, `edit`, `delete` | `/admin/videos` |
| خبرنامه (`newsletter`) | `manage` | فقط تنظیمات (فعال/غیرفعال در `settings.modules`) |

| عمل | مجوز | UI |
|-----|------|-----|
| نام نمایشی + فعال/غیرفعال ماژول | `settings.modules` | `/admin/settings/modules` |
| CRUD محتوای ماژول | `modules.*` | `/admin/content-group`, `/admin/videos` |
| تنظیمات بخش ماژول | `modules.*.edit` | `/admin/content-group/settings`, `/admin/videos/settings` |
| مدیریت خبرنامه | `modules.newsletter.manage` | تنظیمات ماژول |

## ماژول‌ها

`ModuleSettings` در `site_settings.module_settings`:
- `contentGroup` / `video` / `newsletter`: فعال/غیرفعال + `label` (نام منوی کنار)

تنظیمات بخش ماژول (ستون‌های جدا):
- `content_group_module_settings`: `period` (`yearly|seasonal|monthly|weekly`), `groupByYear`
- `video_module_settings`: `pageTitle`, `itemsPerPage`
- `media_settings`: `maxImageBytes` (پیش‌فرض 10MB), `maxPdfBytes` (پیش‌فرض 25MB), `allowedMime`, `pipeline`

برچسب پیش‌فرض: `packages/contract/src/modules/labels.ts` + `modulePermissionGroups`

جزئیات تم: `docs/THEMING.md`

## تقویم شمسی

- منبع واحد: `packages/core/src/platform/datetime.ts` — timezone `Asia/Tehran`
- ذخیره: ISO `YYYY-MM-DD`؛ نمایش: `formatJalali()`
- ادمین: `JalaliDateField`؛ public: `JalaliDate`

## Publish workflow

- `draft` → ذخیره پیش‌نویس
- «انتشار» → `published` + `publishedAt` (شمسی/ISO از `todayIsoIran()`)
- public فقط `published`

## Media

- آپلود: `packages/studio/src/cms/mutations/media.ts`
- promote یکپارچه: `packages/core/src/media/promote-media.ts`
- تنظیمات: تب «تنظیمات» در `/admin/media` — `maxImageBytes`, `maxPdfBytes`, MIME، pipeline flags
- serve: `GET /uploads/[[...path]]` — `packages/core/src/media/serve-access.ts`
- پیش‌فرض‌ها: `packages/core/src/media/constants.ts` (fallback اگر DB خالی)

### درخت فولدر (`data/uploads/`)

```
site/                      دارایی عمومی سایت (public)
members/{memberId}/        آواتار عضو (public)
members/{memberId}/draft/  staging قبل از ثبت entity (private)
content/{articleId}/       مدیا مقاله (public فقط وقتی status=published)
content-group/{groupId}/   جلد + PDF گروه محتوا (public؛ یک PDF با نام SEO)
videos/{videoId}/          بندانگشتی ویدیو (public)
```

### جریان آپلود

1. **قبل از ثبت** (مقاله، گروه، ویدیو، عضو): `uploadContext.memberId` → `members/{memberId}/draft/`
2. **بعد از ثبت**: آپلود مستقیم در فولدر entity (`content/{id}/`, `content-group/{id}/`, …)
3. **save/create**: `promoteMediaToFolder` — فایل‌های استفاده‌شده از draft به فولدر نهایی منتقل می‌شوند
4. **بایگانی مقاله**: فقط status در DB؛ مدیا در `content/{id}/` می‌ماند
5. **حذف دائمی**: `purgeMediaForContent` — پاکسازی `content/{id}/`

Media picker: entity نساخته → فولدر draft عضو؛ entity ساخته → فولدر همان entity.

### گروه محتوا — PDF

- محدودیت حجم جدا: تصویر جلد و PDF در `/admin/content-group/settings`
- هنگام save: `finalizeContentGroupPdf` — promote، rename به `{pageTitle} شماره {n} - سال {y}.pdf`، purge PDFهای دیگر
- جزئیات SEO: `docs/SEO.md`

### migration legacy

```bash
npm run db:migrate-media-paths   # یک‌بار: shared/، content/draft/، archived/ → ساختار جدید
```

## پایگاه داده (Settings hub)

تب «پایگاه داده» در `/admin/settings/database` با مجوز `settings.database` (افزایش `super_admin`).

دو نوع پشتیبان:

| نوع | محتوا | فرمت | مسیر API |
|------|-------|-------|----------|
| سریع (DB-only) | `pelak.sqlite` | فایل sqlite | `GET /api/admin/database/export`، `POST /api/admin/database/import` |
| کامل (snapshot) | `pelak.sqlite` + `uploads/` + `manifest.json` | `tar.gz` | `GET /api/admin/database/export-snapshot`، `POST /api/admin/database/import-snapshot` |

- آپلود snapshot به‌صورت raw body با `Content-Type: application/gzip` (streaming کامل).
- قبل از ریستور: یک نسخه پشتیبان خودکار از DB فعلی و `uploads/` در `data/backups/` گرفته می‌شود و در صورت خطا rollback می‌شود.
- پس از ریستور کامل، `revalidatePath("/", "layout")` فراخوانی می‌شود؛ برای اعمال کاملِ کانکشن DB، ری‌استارت container توصیه می‌شود.
- جزئیات عملیاتی: `docs/DEPLOYMENT.md`.

## Cache invalidation

بعد از mutation: `updateTag` از `@nextgen-cms/config/cache` — تگ‌ها در `packages/config/src/constants.ts`.

## Auth

- `apps/pelak/proxy.ts` — JWT verify
- `getMemberSession()` در layout و mutations

## افزودن document type

`docs/CMS-SCHEMA.md` و `.cursor/skills/hokmran-studio/SKILL.md`
