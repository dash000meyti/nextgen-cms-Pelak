# UI Boundary — Pelak

ساختار فعلی کامپوننت‌ها در `apps/pelak/components/` و مسیر extract آینده به `packages/ui`. **در این فاز هیچ extract انجام نمی‌شود.**

## ساختار پوشه‌ها

```
apps/pelak/components/
  ui/         primitives — Button, Tag, JalaliDate, …
  admin/      استودیو — studio/, fields/, media/
  home/       بخش‌های صفحهٔ اصلی
  article/    کارت/لیست/هدر مقاله
  issue/      شماره‌ها (ماژول)
  layout/     shell — Container, SiteHeader, Breadcrumbs
  theme/      ThemeProvider, tokens runtime
  contact/    فرم تماس
```

| پوشه | مصرف‌کننده | آینده |
|------|------------|-------|
| `ui/` | site + admin | `packages/ui` (design system) |
| `admin/` | `/admin` فقط | `packages/ui/admin` |
| `home/`, `article/` | site عمومی | `packages/ui` یا app-local |
| `layout/` | هر دو | app-local (brand-specific) |

## قوانین

- کامپوننت‌ها **فقط props** — داده در صفحات از `@nextgen-cms/site-data` (public) یا studio queries (admin)
- theme tokens از `@nextgen-cms/config` + runtime inject (`ThemeTokensProvider`)
- Server Component پیش‌فرض؛ `"use client"` فقط برای state/event
- بدون UI library خارجی — Tailwind v4 + SVG inline
- `packages/studio` package منطق admin است — **نه** app حذف‌شدهٔ `apps/studio`

## package UI آینده

یک design system یکپارچه (shadCN-like) برای public + admin:

- primitives مشترک (`Button`, `Input`, `Badge`, …)
- variants admin با density بالاتر
- theme tokens از `@nextgen-cms/config` — نه hardcode در کامپوننت

## Roadmap (document only)

- [ ] `packages/ui` — design system extract از `components/ui/`
- [ ] نوع محتوا (content types) — schema-driven forms مشترک
- [ ] ماژول نظرات
- [ ] ماژول صفحات (static pages CMS)

جزئیات استایل: `docs/THEMING.md` · skill `hokmran-component`
