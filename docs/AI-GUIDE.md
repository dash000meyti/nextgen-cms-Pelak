# راهنمای Agent — Nextgen CMS

> **قبل از هر تغییر بخوان:** [`AGENTS.md`](../AGENTS.md)

## task → path

| می‌خواهم… | برو به | skill/rule |
|-----------|--------|------------|
| صفحه public | `apps/pelak/app/` | `hokmran-page` |
| کامپوننت UI | `apps/pelak/components/` | `hokmran-component` · `docs/UI-BOUNDARY.md` |
| لینک مدیریت در هدر (کاربر واردشده) | `apps/pelak/app/layout.tsx`, `components/layout/{SiteHeader,AdminLink}.tsx`, `getMemberSession()` | `hokmran-component` · `docs/UI-BOUNDARY.md` · `docs/STUDIO.md` (Auth) |
| داده public | `packages/site-data/src/get-content.ts` | `data-layer.mdc` |
| فرم عمومی (نوشتن پیام) | `packages/site-data/src/messages-actions.ts` (`submitMessage`) | `docs/CMS-SCHEMA.md` · `docs/UI-BOUNDARY.md` (FormMessage) |
| بازخورد خطا/موفقیت فرم | `components/ui/{FormMessage,useFormFeedback}.ts(x)` · `MutationResult.field` | `docs/UI-BOUNDARY.md` · `docs/STUDIO.md` |
| صندوق پیام‌ها (ادمین) | `/admin/messages`, `packages/studio/src/cms/{queries,mutations}/messages.ts` | `docs/STUDIO.md` |
| mutation admin | `packages/studio/src/cms/mutations/` | `admin-studio.mdc` · `hokmran-studio` |
| تنظیمات هاب | `/admin/settings/*` (۷ تب) | `settings-tabs.ts` |
| تنظیمات بخش | `/admin/content/settings`, `/admin/members/settings`, تب مدیا، `/admin/content-group/settings`, `/admin/videos/settings/video`, `/admin/videos/settings/playlists` | `docs/STUDIO.md` |
| query admin | `packages/studio/src/cms/queries/` | `hokmran-studio` |
| schema DB | `packages/core/src/db/schema/` | `data-layer.mdc` |
| type دامنه | `packages/contract/src/types/` | `monorepo.mdc` |
| CMS field defs | `packages/contract/src/cms-schema/` | `hokmran-studio` · `docs/CMS-SCHEMA.md` |
| ادیتور بدنهٔ مقاله (بلوک‌ها) | `apps/pelak/components/admin/blocks/` · `components/article/blockStyles.ts` | `hokmran-studio` · `docs/BLOCK-EDITOR.md` (درگ تکی Toolbar / انتخاب+درگ گروهی Select handle) |
| فیلد مرجع فرم‌ها (اعضا/موضوع/گروه) | `apps/pelak/components/admin/fields/ReferencePicker.tsx` | `hokmran-studio` · `docs/STUDIO.md` |
| فرم محتوا (متادیتای فشرده) | `apps/pelak/components/admin/studio/ArticleForm.tsx` | `hokmran-studio` · `docs/STUDIO.md` |
| مجوز RBAC | `packages/contract/src/permissions.ts` | `hokmran-rbac` · `docs/STUDIO.md` |
| theme tokens | `packages/config/src/theme/` | `hokmran-theme` · `styling.mdc` |
| Docker/startup | `docker/` | `platform-deployment.mdc` · `docs/DEPLOYMENT.md` |
| SEO / sitemap / PDF | `apps/pelak/app/sitemap.ts`, `content-group/[slug]/page.tsx` | `docs/SEO.md` |
| seed/fixture | `packages/seed/src/` | `data-layer.mdc` |
| migration | `packages/core/drizzle/migrations/` | `docs/MIGRATION-POLICY.md` |

## Skills

| skill | کاربرد |
|-------|--------|
| `hokmran-page` | صفحهٔ جدید در `apps/pelak/app/` |
| `hokmran-component` | کامپوننت در `components/ui\|admin\|home\|article\|layout` |
| `hokmran-studio` | document type، settings، mutations |
| `hokmran-rbac` | نقش‌ها، `settings.*`، `modules.*` |
| `hokmran-theme` | theme tokens، feature flags |

## دست نزنید

- `build` بدون migrate/seed
- `DATABASE_URL` production = `file:/data/pelak.sqlite`
- `serverExternalPackages: ['better-sqlite3']`
- volume `/data` در image

## اعتبارسنجی

```bash
npm run ci:check
```

commit فقط با درخواست صریح کاربر.
