---
name: hokmran-studio
description: راهنمای Studio CMS و افزودن document type در پلتفرم حکمران
---

# Studio CMS — حکمران

## خواندن (admin pages)

از `@nextgen-cms/studio/cms/queries/` — نه مستقیم repository در صفحات (ترجیحاً).

## نوشتن

از `packages/studio/src/cms/mutations/` با `requirePermissionMutation`.

## Checklist document type جدید

1. `packages/contract/src/cms-schema/<type>.ts`
2. `packages/core/src/db/repositories/<type>-admin.ts`
3. `packages/studio/src/cms/mutations/<type>.ts` + مجوز RBAC
4. `packages/config/src/constants.ts` + invalidate helper
5. `apps/pelak/components/admin/studio/<Type>Form.tsx`
6. `apps/pelak/app/admin/(panel)/<type>/` routes
7. skill `hokmran-rbac` برای مجوز

جزئیات: `docs/CMS-SCHEMA.md`

## Settings

- هاب ۵ تب: `/admin/settings/<tab>` — `packages/studio/src/admin/settings-tabs.ts`
- تنظیمات بخش: `/admin/content/settings`, `/admin/members/settings`, تب مدیا، `/admin/content-group/settings`, `/admin/videos/settings`
- موضوعات: `/admin/content/settings/topics` — (`settings.content`)
- ماژول‌ها: `settings.modules` = نام + toggle · `modules.*` = CRUD — `ModuleSettingsEditor`

## Publish

- status: `draft` | `published` | `archived`
- Public فقط `published`
- تاریخ: `todayIsoIran()` / `JalaliDateField`

## Block editor

ادیتور بدنهٔ مقاله در `apps/pelak/components/admin/blocks/` — مبتنی بر رجیستری بلوک با درگ‌اند‌دراپ native و درج‌گر `+` بین بلوک‌ها. انواع فعلی: paragraph، heading (h2/h3/h4)، quote، image، video (آپارات)، list (bullet/ordered)، question، button. جزئیات و چک‌لیست افزودن نوع جدید: `docs/BLOCK-EDITOR.md`.

## Media

`ImageField` + `uploadMedia` → URL `/uploads/{uuid}.ext`
تنظیمات: تب «تنظیمات» در `/admin/media`

## قوانین

- Public هرگز mutations import نکند
- Studio هرگز presentation components import نکند
- `npm run ci:check`
