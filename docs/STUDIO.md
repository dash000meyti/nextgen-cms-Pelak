# Studio CMS — حکمران

استودیوی داخلی (schema-driven) برای مدیریت محتوا روی SQLite. مسیر پایه: `/admin`.

## بخش‌های اصلی ادمین

| بخش | مسیر | مجوز نمونه |
|------|------|------------|
| داشبورد | `/admin` | هر عضو واردشده |
| محتوا | `/admin/content` | `content.*` |
| اعضا | `/admin/members` | `members.*` |
| مدیا | `/admin/media` | `media.*` |
| تنظیمات | `/admin/settings/*` | `settings.*` |

## تنظیمات (`/admin/settings`)

هاب **۸ تب** مجوزمحور — تعریف در `packages/studio/src/admin/settings-tabs.ts`:

| تب | مسیر | مجوز |
|----|------|------|
| اطلاعات شخصی | `/admin/settings/personal` | `settings.personal` |
| سایت | `/admin/settings/site` | `settings.site` |
| رنگ‌ها | `/admin/settings/theme` | `settings.theme` |
| نقش‌ها | `/admin/settings/roles` | `settings.roles` |
| محتوا | `/admin/settings/content` | `settings.content` |
| اعضا | `/admin/settings/members` | `settings.members` |
| مدیا | `/admin/settings/media` | `settings.media` |
| ماژول‌ها | `/admin/settings/modules` | `settings.modules` |

`/admin/settings` به اولین تب مجاز redirect می‌شود.

**موضوعات** زیرمجموعهٔ تنظیمات محتوا — نه تب جدا: `/admin/settings/content/topics` (مجوز `settings.content`). مسیرهای قدیم (`/admin/settings/topics`, `/admin/topics`) → redirect.

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
| هسته | `content.publish`, `members.edit`, `media.upload` |
| تنظیمات | `settings.content`, `settings.modules`, … |
| ماژول | `modules.contentGroup.view`, `modules.video.create`, `modules.newsletter.manage` |

### مجوزهای ماژول

| ماژول | مجوزها | مسیر ادمین |
|-------|--------|------------|
| گروه‌های محتوا (`contentGroup`) | `view`, `create`, `edit`, `delete` | `/admin/content-group` |
| ویدیو (`video`) | `view`, `create`, `edit`, `delete` | `/admin/videos` |
| خبرنامه (`newsletter`) | `manage` | فقط تنظیمات (فعال/غیرفعال در `settings.modules`) |

| عمل | مجوز | UI |
|-----|------|-----|
| toggle فعال/غیرفعال ماژول | `settings.modules` | `/admin/settings/modules` |
| CRUD محتوای ماژول | `modules.*` | `/admin/content-group`, `/admin/videos` |
| مدیریت خبرنامه | `modules.newsletter.manage` | تنظیمات ماژول |

## ماژول‌ها

`ModuleSettings` در `site_settings.module_settings`:
- `contentGroup`: فعال/غیرفعال + دوره (`yearly|seasonal|monthly|weekly`)
- `video`: فعال + عنوان صفحه + تعداد در صفحه
- `newsletter`: فعال/غیرفعال

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
- تنظیمات: تب `/admin/settings/media` — max size، MIME، pipeline flags
- serve: `GET /uploads/[[...path]]` — `packages/core/src/media/serve-access.ts`
- پیش‌فرض‌ها: `packages/core/src/media/constants.ts` (fallback اگر DB خالی)

### درخت فولدر (`data/uploads/`)

```
site/                      دارایی عمومی سایت (public)
members/{memberId}/        آواتار عضو (public)
members/{memberId}/draft/  staging قبل از ثبت entity (private)
content/{articleId}/       مدیا مقاله (public فقط وقتی status=published)
content-group/{groupId}/   جلد گروه محتوا (public)
videos/{videoId}/          بندانگشتی ویدیو (public)
```

### جریان آپلود

1. **قبل از ثبت** (مقاله، گروه، ویدیو، عضو): `uploadContext.memberId` → `members/{memberId}/draft/`
2. **بعد از ثبت**: آپلود مستقیم در فولدر entity (`content/{id}/`, `content-group/{id}/`, …)
3. **save/create**: `promoteMediaToFolder` — فایل‌های استفاده‌شده از draft به فولدر نهایی منتقل می‌شوند
4. **بایگانی مقاله**: فقط status در DB؛ مدیا در `content/{id}/` می‌ماند
5. **حذف دائمی**: `purgeMediaForContent` — پاکسازی `content/{id}/`

Media picker: entity نساخته → فولدر draft عضو؛ entity ساخته → فولدر همان entity.

### migration legacy

```bash
npm run db:migrate-media-paths   # یک‌بار: shared/، content/draft/، archived/ → ساختار جدید
```

## Cache invalidation

بعد از mutation: `updateTag` از `@nextgen-cms/config/cache` — تگ‌ها در `packages/config/src/constants.ts`.

## Auth

- `apps/pelak/proxy.ts` — JWT verify
- `getMemberSession()` در layout و mutations

## افزودن document type

`docs/CMS-SCHEMA.md` و `.cursor/skills/hokmran-studio/SKILL.md`
