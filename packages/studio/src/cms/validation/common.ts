import type {
  ArticleBlock,
  HeadingLevel,
  ImageMeta,
} from "@nextgen-cms/contract/types/article";

export type ValidationIssue = {
  message: string;
  field: string;
};

export function issue(field: string, message: string): ValidationIssue {
  return { message, field };
}

export function validateRequired(
  value: string | undefined | null,
  label: string,
  field: string,
): ValidationIssue | undefined {
  if (!value?.trim()) return issue(field, `${label} الزامی است.`);
  return undefined;
}

export function validateImageMeta(
  src: string,
  alt: string,
  label = "تصویر",
  fields: { src: string; alt: string } = { src: "image", alt: "imageAlt" },
): ValidationIssue | undefined {
  const srcError = validateRequired(src, label, fields.src);
  if (srcError) return srcError;
  if (!alt.trim()) {
    return issue(fields.alt, `متن جایگزین ${label} الزامی است.`);
  }
  return undefined;
}

function isImageMeta(value: unknown): value is ImageMeta {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return typeof obj.src === "string" && typeof obj.alt === "string";
}

function isHeadingLevel(value: unknown): value is HeadingLevel {
  return value === 2 || value === 3 || value === 4;
}

function blockIssue(index: number, message: string): ValidationIssue {
  return issue(`body.${index}`, message);
}

export function validateArticleBlocks(
  blocks: unknown,
): ValidationIssue | undefined {
  if (!Array.isArray(blocks)) {
    return issue("body", "بدنهٔ محتوا نامعتبر است.");
  }
  if (blocks.length === 0) {
    return issue("body", "حداقل یک بلوک متن لازم است.");
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as Record<string, unknown>;
    const type = block.type;
    const at = `بلوک ${i + 1}`;

    if (type === "paragraph") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return blockIssue(i, `${at}: محتوا الزامی است.`);
      }
    } else if (type === "heading") {
      if (!isHeadingLevel(block.level)) {
        return blockIssue(i, `${at}: سطح عنوان نامعتبر است (۲، ۳ یا ۴).`);
      }
      if (typeof block.content !== "string" || !block.content.trim()) {
        return blockIssue(i, `${at}: متن عنوان الزامی است.`);
      }
    } else if (type === "quote") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return blockIssue(i, `${at}: نقل‌قول الزامی است.`);
      }
    } else if (type === "image") {
      if (!isImageMeta(block.image)) {
        return blockIssue(i, `${at}: تصویر نامعتبر است.`);
      }
      if (!block.image.alt.trim()) {
        return blockIssue(i, `${at}: متن جایگزین تصویر بلوک الزامی است.`);
      }
    } else if (type === "video") {
      if (typeof block.src !== "string" || !block.src.trim()) {
        return blockIssue(i, `${at}: لینک ویدیو الزامی است.`);
      }
    } else if (type === "list") {
      if (
        block.variant !== "bullet" &&
        block.variant !== "ordered" &&
        block.variant !== "dash"
      ) {
        return blockIssue(i, `${at}: نوع لیست نامعتبر است.`);
      }
      if (
        !Array.isArray(block.items) ||
        block.items.length === 0 ||
        !block.items.some((item) => typeof item === "string" && item.trim())
      ) {
        return blockIssue(i, `${at}: حداقل یک مورد لیست الزامی است.`);
      }
    } else if (type === "question") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return blockIssue(i, `${at}: متن پرسش الزامی است.`);
      }
    } else if (type === "button") {
      if (typeof block.label !== "string" || !block.label.trim()) {
        return blockIssue(i, `${at}: برچسب دکمه الزامی است.`);
      }
      if (typeof block.href !== "string" || !block.href.trim()) {
        return blockIssue(i, `${at}: لینک دکمه الزامی است.`);
      }
      if (
        block.variant !== undefined &&
        block.variant !== "primary" &&
        block.variant !== "outline" &&
        block.variant !== "secondary"
      ) {
        return blockIssue(i, `${at}: نوع دکمه نامعتبر است.`);
      }
    } else if (type === "table") {
      if (
        !Array.isArray(block.headers) ||
        block.headers.length === 0 ||
        !block.headers.every((h) => typeof h === "string")
      ) {
        return blockIssue(i, `${at}: هدرهای جدول نامعتبر است.`);
      }
      if (!Array.isArray(block.rows) || block.rows.length === 0) {
        return blockIssue(i, `${at}: حداقل یک ردیف جدول لازم است.`);
      }
      const colCount = block.headers.length;
      for (let r = 0; r < block.rows.length; r++) {
        const row = block.rows[r];
        if (
          !Array.isArray(row) ||
          row.length !== colCount ||
          !row.every((c) => typeof c === "string")
        ) {
          return blockIssue(i, `${at}: ردیف ${r + 1} جدول نامعتبر است.`);
        }
      }
      const hasContent =
        block.headers.some((h) => typeof h === "string" && h.trim()) ||
        block.rows.some(
          (row) =>
            Array.isArray(row) &&
            row.some((c) => typeof c === "string" && c.trim()),
        );
      if (!hasContent) {
        return blockIssue(i, `${at}: حداقل یک سلول جدول باید پر باشد.`);
      }
    } else {
      return blockIssue(i, `${at}: نوع نامعتبر است.`);
    }
  }

  return undefined;
}

export function parseArticleBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block) => {
    if (block.type === "heading") {
      return {
        type: "heading",
        level: block.level,
        content: block.content,
      };
    }
    if (block.type === "quote" && !block.attribution) {
      const { attribution: _, ...rest } = block;
      return rest;
    }
    if (block.type === "image") {
      const { image } = block;
      return {
        type: "image" as const,
        image: {
          src: image.src,
          alt: image.alt,
          ...(image.caption ? { caption: image.caption } : {}),
          ...(image.credit ? { credit: image.credit } : {}),
        },
      };
    }
    if (block.type === "video") {
      const { src, caption } = block;
      return {
        type: "video" as const,
        src,
        ...(caption?.trim() ? { caption } : {}),
      };
    }
    if (block.type === "list") {
      const items = block.items.map((item) => item.trim()).filter(Boolean);
      return { type: "list", variant: block.variant, items };
    }
    if (block.type === "question") {
      const { content, answer } = block;
      return {
        type: "question" as const,
        content,
        ...(answer?.trim() ? { answer } : {}),
      };
    }
    if (block.type === "button") {
      const { label, href, variant } = block;
      return {
        type: "button" as const,
        label: label.trim(),
        href: href.trim(),
        ...(variant && variant !== "outline" ? { variant } : {}),
      };
    }
    if (block.type === "table") {
      return {
        type: "table" as const,
        headers: block.headers.map((h) => h.trim()),
        rows: block.rows.map((row) => row.map((c) => c.trim())),
      };
    }
    return block;
  });
}
