# Block Editor — حکمران

ادیتور بدنهٔ مقاله، مبتنی بر **رجیستری بلوک** و قابل‌گسترش. مسیر: `apps/pelak/components/admin/blocks/`.

## انواع بلوک

| type | شکل داده | گروه |
|------|----------|------|
| `paragraph` | `{ type, content }` | text |
| `heading` | `{ type, level: 2\|3\|4, content }` | text |
| `quote` | `{ type, content, attribution? }` | text |
| `list` | `{ type, variant: "bullet"\|"ordered", items: string[] }` | text |
| `question` | `{ type, content, answer? }` | text |
| `image` | `{ type, image: ImageMeta }` | media |
| `video` | `{ type, src, caption? }` — آپارات | media |
| `button` | `{ type, label, href, variant?: "primary"\|"outline" }` | interactive |

تایپ کانونیکال: `ArticleBlock` در `packages/contract/src/types/article.ts`.

## معماری

```mermaid
flowchart TB
  Shell["BlockEditor.tsx<br/>shell + sticky toolbar"] --> DragList["BlockDragList.tsx<br/>DnD + insertion zones"]
  DragList --> Wrapper["BlockWrapper.tsx<br/>hover toolbar + drag handle"]
  Wrapper --> Editor["block.Editor"]
  Registry["blockRegistry.tsx"] --> Editor
  Registry --> Toolbar["BlockToolbar.tsx<br/>transform / move / delete"]
  Registry --> InsertMenu["BlockInsertMenu.tsx<br/>+ menu"]
  DragList --> Zone["InsertionZone.tsx<br/>+ between blocks"]
  Zone --> InsertMenu
```

### رجیستری

`blockRegistry.tsx` یک `Record<BlockType, BlockMeta>` است:

```ts
type BlockMeta = {
  type: BlockType;
  label: string;            // فارسی
  group: "text" | "media" | "interactive";
  Icon: BlockIcon;          // inline SVG
  createDefault: () => ArticleBlock;
  Editor: BlockEditorComponent;
  convertibleTo: BlockType[];  // تبدیل نوع
};
```

هیچ منطقی در shell به نوع خاص گره نخورده — همه‌چیز از رجیستری می‌آید.

### تعامل

- **درگ‌اند‌دراپ native** (HTML5) — بدون کتاب‌خانه. drag handle در نوار ابزار hover؛ drop روی insertion zoneها.
- **+ بین بلوک‌ها** — `InsertionZone` ناحیه‌ای نازک که روی hover علامت `+` نشان می‌دهد و منوی `BlockInsertMenu` را باز می‌کند.
- **تبدیل نوع** — `convertBlock(source, target)` متن اصلی را حفظ می‌کند؛ منوی transform در `BlockToolbar`.
- **سطح heading** — Pills مستقیم در `HeadingBlock` (سریع‌ترین مسیر).
- **لیست** — Enter برای افزودن مورد، Backspace روی مورد خالی برای حذف.

### RTL

فقط کلاس‌های منطقی Tailwind: `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`border-s`/`border-e`. بدون `left/right`.

## ذخیره‌سازی

`articles.body` در SQLite به‌صورت JSON آرایه‌ای از `ArticleBlock`. دادهٔ قدیمی (مثل `heading` بدون `level`) با `normalizeArticleBlock` در زمان خواندن نرمال می‌شود — **migration DB لازم نیست**.

## رندر عمومی

`apps/pelak/components/article/ArticleBody.tsx` همهٔ انواع را رندر می‌کند. PDF: `lib/pdf/html/blocks.ts` + `lib/pdf/resolve-blocks.ts`. آپارات: `lib/aparat.ts`.

## افزودن نوع بلوک جدید

1. **Contract** — عضو جدید در `ArticleBlock` (+ `BlockType` خودکار) در `packages/contract/src/types/article.ts`. اگر دادهٔ قدیمی ممکن است ناقص باشد، در `normalizeArticleBlock` پوششش بده.
2. **استValidators** — `validateArticleBlocks` و `parseArticleBlocks` در `packages/studio/src/cms/validation/common.ts`.
3. **رجیستری + کامپوننت** — فایل `apps/pelak/components/admin/blocks/blocks/FooBlock.tsx` + رکورد در `blockRegistry.tsx` (شامل `createDefault`، `Editor`، `convertibleTo`).
4. **رندر** — `ArticleBody.tsx` (و `lib/pdf/html/blocks.ts` + `resolve-blocks.ts` اگر لازم).
5. **Seed (اختیاری)** — fixture در `packages/seed/src/fixtures/articles.ts`.
6. **آیکون** — افزودن به `blocks/icons.tsx` اگر نوع آیکون جدید می‌خواهد.
7. `npm run ci:check`.

## اسناد مرتبط

- `docs/UI-BOUNDARY.md` — ساختار کامپوننت‌ها
- `docs/CMS-SCHEMA.md` — `kind: "blocks"`
- skill `hokmran-studio` — مسیر ادیتور
