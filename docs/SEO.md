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
- `slugifyTitle()` از عنوان فارسی نامک می‌سازد (فاصله/ZWNJ → `-`)
- نامک‌های رزرو (`admin`, `api`, `content-group`, …) همچنان لاتین و مسدود
- URL عمومی: `/content/[slug]` — Next.js segment را encode می‌کند

## Sitemap و robots

| فایل | مسیر |
|------|------|
| sitemap | `apps/pelak/app/sitemap.ts` → `/sitemap.xml` |
| robots | `apps/pelak/app/robots.ts` → `/robots.txt` |

شامل:
- صفحات ثابت (`/`, `/content`, `/content-group`, `/members`, …)
- مقالات، نویسنده‌ها، موضوعات، گروه‌های محتوا
- **URL مستقیم PDF** گروه‌های محتوا (فقط وقتی `pdfSrc` دارند)
- `lastModified` از `publishedAt` برای مقالات و گروه‌های محتوا

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
{pageTitle} شماره {number} - سال {year}.pdf
```

- `pageTitle` از `/admin/content-group/settings` (پیش‌فرض: «هفته‌نامه»)
- اعداد فارسی (`toLocaleString("fa-IR")`)
- منطق: `packages/core/src/media/content-group-pdf.ts` + `finalize-content-group-pdf.ts`

### یک PDF per folder

در `content-group/{id}/` فقط یک PDF نگه‌داری می‌شود؛ جایگزینی یا حذف، فایل‌های قبلی را purge می‌کند.

### کشف توسط موتور جستجو

1. لینک دانلود در `ShareBar` با `type="application/pdf"`
2. `alternates.types["application/pdf"]` در metadata صفحه
3. URL PDF در sitemap
4. JSON-LD `PublicationIssue` + `associatedMedia` در صفحهٔ گروه
5. `Content-Disposition: inline; filename*=UTF-8''…` در `GET /uploads/.../*.pdf`

PDF آپلودشده canonical است؛ route تولیدی `/api/pdf/content-group/[number]` در UI استفاده نمی‌شود.

## JSON-LD

صفحهٔ گروه محتوا (`content-group/[number]/page.tsx`):

- `@type`: `PublicationIssue`
- `issueNumber`, `datePublished`, `url`
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
- `VideoObject` JSON-LD برای ماژول ویدیو
