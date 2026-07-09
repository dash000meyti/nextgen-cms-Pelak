# SEO — Nextgen CMS (Pelak)

راهنمای بهینه‌سازی موتور جستجو در `apps/pelak`.

## پیش‌نیاز deploy

| متغیر | کاربرد |
|-------|--------|
| `NEXT_PUBLIC_SITE_URL` | canonical، sitemap، Open Graph، JSON-LD |

جزئیات: [`DEPLOYMENT.md`](DEPLOYMENT.md)

## نامک (slug)

- اعتبارسنجی: `packages/studio/src/cms/validation/slug.ts`
- الگو: حروف **فارسی یا لاتین**، اعداد، خط تیره — `[\p{Script=Arabic}a-z0-9]+(?:-…)*`
- نرمال‌سازی canonical: `normalizeSlugInput()` (Unicode NFKC + lowercase + حذف کاراکترهای نامرئی + فاصله‌ها → `-` + collapse دَش‌ها + trim دَش ابتدا/انتها)
- `slugifyTitle()` از عنوان فارسی نامک می‌سازد و از همان policy canonical استفاده می‌کند
- نامک‌های رزرو (`admin`, `api`, `content-group`, …) همچنان لاتین و مسدود
- URL عمومی: `/content/[slug]` و مسیرهای مشابه، segment را با `encodeURIComponent` تولید می‌کنند
- ورودی routeهای داینامیک قبل از lookup با decode/normalize بررسی می‌شود؛ در صورت mismatch با slug canonical، ریدایرکت دائمی `301` انجام می‌شود

## Sitemap و robots

| فایل | مسیر |
|------|------|
| sitemap | `apps/pelak/app/sitemap.ts` → `/sitemap.xml` |
| robots | `apps/pelak/app/robots.ts` → `/robots.txt` |

شامل:
- صفحات ثابت (`/`, `/content`, `/content-group`, `/members`, …)
- مقالات، نویسنده‌ها، موضوعات، لیست‌های پخش و گروه‌های محتوا
- URL مستقیم PDF گروه‌های محتوا (فقط وقتی `pdfSrc` دارند)
- `lastModified` از `publishedAt` برای مقالات و گروه‌های محتوا
- segmentهای slug در sitemap به‌صورت `encodeURIComponent` ساخته می‌شوند

`robots.txt` مسیرهای `/admin`، `/p/` و `/api/pdf/` را disallow می‌کند.

## متادیتای صفحات

| صفحه | title | description | canonical | OG | PDF alternate |
|------|-------|-------------|-----------|-----|---------------|
| مقاله | ✓ | ✓ | ✓ | partial | API تولیدی |
| گروه محتوا | ✓ | ✓ | ✓ | ✓ | ✓ (`alternates.types`) |
| عضو / موضوع | ✓ | ✓ | partial | partial | — |

## گروه محتوا و PDF

### نام فایل SEO

هنگام save، PDF به این الگو rename می‌شود:

```
{title} - {slug}.pdf
```

- `title` و `slug` از فیلدهای گروه محتوا
- منطق: `packages/core/src/media/content-group-pdf.ts` + `finalize-content-group-pdf.ts`
- در دانلود فایل آپلودشده، نام دانلودی بر پایه عنوان گروه و با الگوی `title.pdf` تنظیم می‌شود.

### یک PDF per folder

در `content-group/{id}/` فقط یک PDF نگه‌داری می‌شود؛ جایگزینی یا حذف، فایل‌های قبلی را purge می‌کند.

### کشف توسط موتور جستجو

1. لینک دانلود در `ShareBar` با `type="application/pdf"`
2. `alternates.types["application/pdf"]` در metadata صفحه
3. URL PDF در sitemap (بر پایه `pdfSrc`)
4. JSON-LD `PublicationIssue` + `associatedMedia` در صفحهٔ گروه
5. `Content-Disposition: inline; filename*=UTF-8''…` در `GET /uploads/.../*.pdf`

برای گروه محتوا، `pdfSrc` (فایل آپلودشده در uploads) canonical است (metadata + sitemap + دکمهٔ دانلود).
دکمهٔ دانلود فقط زمانی نمایش داده می‌شود که `pdfSrc` وجود داشته باشد.

## دانلود PDF مقاله

- route: `/api/pdf/content/{id}`
- نام فایل: `{articleSlug}.pdf`
- UI: `ShareBar` با `fetch` + blob دانلود می‌کند؛ در خطا پیام فارسی نمایش داده می‌شود (نه فایل `.json`)
- خطای سرور: `text/plain` با status `500` (نه JSON)

## JSON-LD

صفحهٔ گروه محتوا (`content-group/[slug]/page.tsx`):

- `@type`: `PublicationIssue`
- `name`, `datePublished`, `url`
- `isPartOf` → `Periodical` با نام `pageTitle`
- `associatedMedia` → PDF (در صورت وجود)

## محدودیت حجم آپلود

تنظیم در `/admin/media?tab=settings` (`MediaSettings`):

| فیلد | پیش‌فرض |
|------|---------|
| `maxImageBytes` | 10 MB |
| `maxPdfBytes` | 25 MB |

سقف transport در `next.config.ts`:

- `experimental.proxyClientMaxBodySize: "30mb"`
- `experimental.serverActions.bodySizeLimit: "30mb"`

هر دو باید بالاتر از `maxPdfBytes` باشند.

## بهبودهای آینده (پیشنهادی)

- Twitter Card metadata
- `og:url` / `og:site_name` یکسان در همهٔ انواع محتوا
- hreflang در صورت نسخهٔ انگلیسی
- `VideoObject` JSON-LD برای ماژول ویدیو (با `contentUrl` روی `externalLink` و `thumbnailUrl` از thumbnail)
