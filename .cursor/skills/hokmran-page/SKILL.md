---
name: hokmran-page
description: راهنمای ساخت صفحهٔ جدید در پروژه حکمران
---

# ساخت صفحهٔ حکمران

تنها مسیر صفحات: `apps/pelak/app/`

## ۱. مسیر

- صفحهٔ استاتیک: `apps/pelak/app/<segment>/page.tsx`
- داینامیک: `apps/pelak/app/<segment>/[param]/page.tsx`

## ۲. ساختار صفحه

```tsx
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionHeader } from "@/components/article/SectionHeader";
// accessorها از @nextgen-cms/site-data/get-content

export const metadata: Metadata = { title: "..." };

export default function XPage() {
  const data = getX();
  return (
    <Container className="py-10 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: "..." }]} />
      <div className="mt-6">
        <SectionHeader title="..." description="..." />
      </div>
    </Container>
  );
}
```

## ۳. مسیر داینامیک

- `generateStaticParams()` با `getAll*` مربوطه.
- `generateMetadata({ params })` — `params` یک `Promise` است؛ `await` کن.
- `notFound()` هنگام نبود داده.

## ۴. قواعد

- Server Component پیش‌فرض. client فقط در کامپوننت جدا.
- SiteHeader/SiteFooter در `app/layout.tsx` — تکرار نکن.
- accessor → props به کامپوننت (`components/home|article/`).

## ۵. اعتبارسنجی

`npm run ci:check`
