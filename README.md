# حکمران — هفته‌نامه سیاسی-اقتصادی

سایت هفته‌نامهٔ فارسی «حکمران» با چیدمان ویرایشی مشابه [Foreign Affairs](https://www.foreignaffairs.com/)، برند قرمز، فونت IRANSans، حالت روشن/تیره، و دادهٔ ماک.

> این نسخه فقط لایهٔ UI است. داده‌ها ماک‌اند و بک‌اند بعداً به accessorهای `lib/data/get-content.ts` وصل می‌شود.

## اجرا

```bash
npm run dev      # http://localhost:3134
npm run build    # build تولیدی
npm run lint     # biome check
npm run format   # biome format --write
```

## مسیرها

- `/` — صفحهٔ اصلی (گروه محتوای جاری، مقالات اصلی، پرخواننده‌ترین‌ها، موضوعات، انتخاب سردبیر، ویدیوها، خبرنامه)
- `/articles` — فهرست مقالات با فیلتر موضوع
- `/articles/[slug]` — صفحهٔ خواندن مقاله
- `/topics/[slug]` — مقالات هر موضوع
- `/authors/[slug]` — صفحهٔ نویسنده
- `/content-group` — آرشیو هفته‌نامه
- `/content-group/[number]` — جزئیات هر گروه محتوا
- `/video` — ویدیوها
- `/about` — درباره ما
- `/contact` — تماس با ما

## ساختار

```
app/            مسیرها (Server Components پیش‌فرض)
components/      layout, article, home, content-group, video, contact, ui, theme
lib/types/       قرارداد داده (article, content-group, site)
lib/data/        ماک + accessorها (get-content.ts تنها منبع)
public/images/   placeholderهای SVG
scripts/         generate-placeholders.mjs
.cursor/         rules + skills
```

## قراردادها

- کامپوننت‌ها فقط `props` می‌گیرند؛ داده از `lib/data/get-content.ts`.
- بدون لایبرری UI؛ همه‌چیز دست‌ساز با Tailwind v4.
- RTL، فونت IRANSans، رنگ برند قرمز `#8b0016`.
- تم روشن/تیره با `ThemeProvider` + FOUC script.

جزئیات در [AGENTS.md](AGENTS.md)، قوانین در `.cursor/rules/`، و اسکیل در `.cursor/skills/`.

## نقشهٔ راه بک‌اند

1. پیاده‌سازی API مطابق تایپ‌های `lib/types/*`.
2. جایگزینی accessorهای `lib/data/get-content.ts` با fetch/API (تایپ‌ها و کامپوننت‌ها ثابت می‌مانند).
3. حذف ماک‌های `lib/data/` پس از اتصال.

## تصاویر placeholder

```bash
node scripts/generate-placeholders.mjs
```
