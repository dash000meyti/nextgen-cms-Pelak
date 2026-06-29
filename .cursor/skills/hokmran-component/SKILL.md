---
name: hokmran-component
description: راهنمای ساخت کامپوننت جدید در پروژه حکمران
---

# ساخت کامپوننت حکمران

مرجع ساختار: `docs/UI-BOUNDARY.md`

## ۱. محل فایل (`apps/pelak/components/`)

| پوشه | کاربرد |
|------|--------|
| `ui/` | primitives — Button, Tag, JalaliDate, … |
| `admin/` | استودیو — `studio/`, `fields/`, `media/` |
| `home/` | بخش‌های صفحهٔ اصلی |
| `article/` | کارت/لیست/هدر مقاله |
| `content-group/` | گروه‌های محتوا (ماژول) |
| `layout/` | shell — Container, SiteHeader, Breadcrumbs |
| `theme/` | ThemeProvider, tokens |
| `contact/` | فرم تماس |

## ۲. ساختار

- یک export اصلی PascalCase. فقط `"use client"` اگر state/رویداد لازم است.
- props با تایپ `type FooProps = { ... }`.
- هیچ import مستقیم از DB/fixture. داده از props.
- primitives موجود را بسط بده: `Tag`, `Button`, `AuthorChipList`, `Container`, …

## ۳. استایل

- توکن‌ها: `text-ink`, `text-accent`, `bg-paper`, `border-rule` — منبع: `@nextgen-cms/config`
- عناوین: `font-heading`. بدنه: `font-sans`.
- عرض: داخل `Container`. RTL: `ps-`/`pe-`/`ms-`/`me-`.

## ۴. تصاویر

- `next/image` با `fill` + `aspect-*` + `sizes`.

## ۵. اعتبارسنجی

`npm run ci:check`
