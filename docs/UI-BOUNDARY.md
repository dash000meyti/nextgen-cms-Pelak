# UI Boundary — Pelak

ساختار فعلی کامپوننت‌ها در `apps/pelak/components/` و مسیر extract آینده به `packages/ui`. **در این فاز هیچ extract انجام نمی‌شود.**

## ساختار پوشه‌ها

```
apps/pelak/components/
  ui/         primitives — Button, Tag, JalaliDate, …
  admin/      استودیو — studio/, fields/, media/, blocks/
  home/       بخش‌های صفحهٔ اصلی
  article/    کارت/لیست/هدر مقاله
  content-group/      گروه‌های محتوا (ماژول)
  layout/     shell — Container, SiteHeader, AdminLink, Breadcrumbs
  theme/      ThemeProvider, tokens runtime
  contact/    فرم تماس
```

| پوشه | مصرف‌کننده | آینده |
|------|------------|-------|
| `ui/` | site + admin | `packages/ui` (design system) |
| `admin/` | `/admin` فقط | `packages/ui/admin` |
| `admin/blocks/` | ادیتور بدنهٔ مقاله | رجیستری بلوک — جزئیات `docs/BLOCK-EDITOR.md` |
| `home/`, `article/` | site عمومی | `packages/ui` یا app-local |
| `layout/` | هر دو | app-local (brand-specific) |

## قوانین

- کامپوننت‌ها **فقط props** — داده در صفحات از `@nextgen-cms/site-data` (public) یا studio queries (admin)
- theme tokens از `@nextgen-cms/config` + runtime inject (`ThemeTokensProvider`)
- Server Component پیش‌فرض؛ `"use client"` فقط برای state/event
- بدون UI library خارجی — Tailwind v4 + SVG inline
- `packages/studio` package منطق admin است — **نه** app حذف‌شدهٔ `apps/studio`

## Public shell (`layout/`)

- `SiteHeader` و `SiteFooter` فقط در root `app/layout.tsx` mount می‌شوند — admin shell جداگانه در `app/admin/(panel)/layout.tsx` دارد.
- ناحیهٔ utility هدر (سمت چپ در RTL): `AdminLink` (شرطی) · `ThemeToggle` · `SearchTrigger`.
- **استثنای session (ناوبری):** root layout می‌تواند `getMemberSession()` از `@nextgen-cms/studio/admin/session` را **فقط برای UI شرطی** بخواند و prop boolean مثل `showAdminLink` به `SiteHeader` بدهد. کامپوننت‌های `layout/` همچنان props-only — بدون import session/DB.
- `AdminLink` Server Component است؛ وقتی `showAdminLink` true باشد به `/admin` لینک می‌دهد. authorization واقعی در `proxy.ts` و RBAC admin انجام می‌شود.
- `utilityLinks` در `SiteConfig` (CMS) لینک‌های استاتیک است — جدا از لینک session-driven مدیریت.

## package UI آینده

یک design system یکپارچه (shadCN-like) برای public + admin:

- primitives مشترک (`Button`, `Input`, `Badge`, …)
- variants admin با density بالاتر
- theme tokens از `@nextgen-cms/config` — نه hardcode در کامپوننت

## Roadmap (document only)

- [ ] `packages/ui` — design system extract از `components/ui/`
- [x] ادیتور بلوکی قابل‌گسترش (رجیستری) — `docs/BLOCK-EDITOR.md`
- [ ] نوع محتوا (content types) — schema-driven forms مشترک
- [ ] ماژول نظرات
- [ ] ماژول صفحات (static pages CMS)

جزئیات استایل: `docs/THEMING.md` · skill `hokmran-component`
