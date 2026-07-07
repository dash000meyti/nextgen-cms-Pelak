# CMS Schema — حکمران

## مفهوم

هر document type در `packages/contract/src/cms-schema/` با `DocumentSchema` تعریف می‌شود.

```typescript
import type { DocumentSchema } from "@nextgen-cms/contract/cms-schema/types";

export const exampleSchema = {
  type: "article",
  label: "مقاله",
  labelPlural: "مقالات",
  fields: [
    { key: "title", label: "عنوان", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", unique: true },
    { key: "publishedAt", label: "تاریخ", kind: "date" },
  ],
} satisfies DocumentSchema;
```

## Field kinds

| kind | کاربرد |
|------|--------|
| `text` | ورودی تک‌خطی |
| `textarea` | متن چندخطی |
| `slug` | نامک |
| `number` | عدد |
| `boolean` | checkbox |
| `date` | تاریخ شمسی (ادمین: `JalaliDateField`) |
| `image` | URL + آپلود |
| `blocks` | `ArticleBlock[]` — ادیتور بلوکی (رجیستری) — `docs/BLOCK-EDITOR.md` |
| `reference` | entity دیگر |
| `status` | وضعیت publish |
| `palette` | `ThemePalette` |
| `modules` | `ModuleSettings` |
| `select` | dropdown |
| `json` | JSON خام |

## Content group schema پویا

`getContentGroupFieldDefs(period)` در `packages/contract/src/cms-schema/content-group.ts` — فیلدها بر اساس `yearly|seasonal|monthly|weekly`.

تنظیمات ماژول (`ContentGroupModuleSettings` در `site_settings.content_group_module_settings`):

| فیلد | پیش‌فرض |
|------|---------|
| `pageTitle` | هفته‌نامه |
| `period` | seasonal |
| `maxImageBytes` | 10 MB |
| `maxPdfBytes` | 25 MB |
| `groupByYear` | false |

## Settings schemas

`packages/contract/src/cms-schema/settings.ts` — site، theme، modules، media، members، content.

## Checklist نوع جدید

1. **Schema** — `packages/contract/src/cms-schema/<type>.ts`
2. **Repository** — `packages/core/src/db/repositories/<type>-admin.ts`
3. **Mutation** — `packages/studio/src/cms/mutations/<type>.ts` با `requirePermissionMutation("…")`
4. **Cache tag** — `packages/config/src/cache.ts`
5. **UI** — `apps/pelak/components/admin/studio/<Type>Form.tsx`
6. **Routes** — `apps/pelak/app/admin/(panel)/…`
7. **Permission** — افزودن به `permissions.ts` در صورت نیاز + skill `hokmran-rbac`

## Singleton settings

`/admin/settings/<tab>` — هر تب `requirePermission("settings.*")` سرورساید.

## Types

از `@nextgen-cms/contract/types/*` — duplicate نساز.

## Slug

- الگو: حروف فارسی یا لاتین، اعداد، خط تیره — `[\p{Script=Arabic}a-z0-9]+(?:-…)*`
- یکتا: `assertUniqueSlug()` در mutation
- جزئیات SEO: `docs/SEO.md`
