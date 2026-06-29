---
name: hokmran-rbac
description: راهنمای RBAC، نقش‌ها و مجوزها در پلتفرم حکمران
---

# RBAC — حکمران

## منابع

| فایل | نقش |
|------|-----|
| `packages/contract/src/permissions.ts` | لیست مجوزها (`resource.action`) |
| `packages/contract/src/roles.ts` | نقش‌های پیش‌فرض + default permissions |
| `packages/core/src/db/schema/roles.ts` | جدول نقش |
| `packages/core/src/db/schema/role-permissions.ts` | junction |
| `packages/studio/src/admin/require-permission.ts` | guard صفحه/mutation |

## لایه‌های مجوز

| لایه | مثال |
|------|------|
| هسته | `content.publish`, `members.edit`, `media.upload` |
| تنظیمات | `settings.content`, `settings.modules`, … |
| **ماژول** | `modules.contentGroup.view`, `modules.video.create`, `modules.newsletter.manage` |

## مجوزهای settings

```
settings.personal  settings.site     settings.theme
settings.roles     settings.content (topics)
settings.members   settings.media    settings.modules
```

`settings.topics` منسوخ است — CRUD موضوعات با `settings.content`؛ migration additive نگه می‌دارد.

## مجوزهای modules

قرارداد نام: `modules.<moduleId>.<action>`

| ماژول | actions | مسیر ادمین |
|-------|---------|------------|
| `contentGroup` | `view`, `create`, `edit`, `delete` | `/admin/content-group` |
| `video` | `view`, `create`, `edit`, `delete` | `/admin/videos` |
| `newsletter` | `manage` | UI/settings فقط |

- فعال/غیرفعال کردن ماژول در سایت: `settings.modules`
- CRUD محتوای ماژول: `modules.*` (نه `settings.content`)
- sidebar: لینک contentGroup/videos فقط با `modules.*.view` + `module_settings.enabled`

## نقش‌های سیستمی

- `super_admin` — همه مجوزها
- `editor_in_chief` — محتوا + members.create + media + settings.content/modules/personal + modules.contentGroup/video + newsletter.manage
- `writer` — content.create/edit_own + media.upload/delete_own + settings.personal

## نقش سفارشی

1. UI: `/admin/settings/roles` — `settings.roles`
2. Mutations: `packages/studio/src/cms/mutations/role.ts`
3. `is_system: true` → فقط checkbox مجوزها؛ slug/name غیرقابل حذف
4. `super_admin` همیشه `settings.roles` + همه مجوزها را نگه می‌دارد
5. حذف نقش: اگر عضو دارد → خطای «این نقش به اعضا اختصاص داده شده است.»

## الگوی mutation

```typescript
const sessionOrDenied = await requirePermissionMutation("modules.contentGroup.create");
if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
```

## الگوی صفحه

```typescript
await requirePermission("modules.contentGroup.view");
```

## UI

- `AdminMemberProvider` + `useAdminMember().permissions` + `enabledModules`
- `SettingsNav` — تب‌ها از `packages/studio/src/admin/settings-tabs.ts`
- Sidebar: لینک اعضا با `members.*`؛ contentGroup/videos با `modules.*.view` + enabled؛ تنظیمات همیشه visible ولی layout بدون مجوز `forbidden()`
- `RolesSettingsPanel` — گروه checkbox «ماژول‌ها» با label فارسی

## Media settings vs media.*

- `settings.media` — تب تنظیمات (max size، MIME، pipeline)
- `media.upload` / `media.delete_*` — عملیات کتابخانهٔ مدیا

## Checklist مجوز جدید

1. افزودن به `permissionActions` در `permissions.ts`
2. seed/migration نقش‌های پیش‌فرض در `roles.ts` + migration SQL additive
3. `requirePermissionMutation` در mutation
4. gate UI (sidebar/tab/button)
5. `docs/STUDIO.md` + این skill
