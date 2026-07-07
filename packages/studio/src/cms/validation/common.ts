import type {
  ArticleBlock,
  HeadingLevel,
  ImageMeta,
} from "@nextgen-cms/contract/types/article";

export function validateRequired(
  value: string | undefined | null,
  label: string,
): string | undefined {
  if (!value?.trim()) return `${label} الزامی است.`;
  return undefined;
}

export function validateImageMeta(
  src: string,
  alt: string,
  label = "تصویر",
): string | undefined {
  const srcError = validateRequired(src, label);
  if (srcError) return srcError;
  if (!alt.trim()) return `متن جایگزین ${label} الزامی است.`;
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

export function validateArticleBlocks(blocks: unknown): string | undefined {
  if (!Array.isArray(blocks)) return "بدنهٔ محتوا نامعتبر است.";
  if (blocks.length === 0) return "حداقل یک بلوک متن لازم است.";

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as Record<string, unknown>;
    const type = block.type;
    const at = `بلوک ${i + 1}`;

    if (type === "paragraph") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `${at}: محتوا الزامی است.`;
      }
    } else if (type === "heading") {
      if (!isHeadingLevel(block.level)) {
        return `${at}: سطح عنوان نامعتبر است (۲، ۳ یا ۴).`;
      }
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `${at}: متن عنوان الزامی است.`;
      }
    } else if (type === "quote") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `${at}: نقل‌قول الزامی است.`;
      }
    } else if (type === "image") {
      if (!isImageMeta(block.image)) {
        return `${at}: تصویر نامعتبر است.`;
      }
      const err = validateImageMeta(
        block.image.src,
        block.image.alt,
        "تصویر بلوک",
      );
      if (err) return `${at}: ${err}`;
    } else if (type === "video") {
      if (typeof block.src !== "string" || !block.src.trim()) {
        return `${at}: لینک ویدیو الزامی است.`;
      }
    } else if (type === "list") {
      if (block.variant !== "bullet" && block.variant !== "ordered") {
        return `${at}: نوع لیست نامعتبر است.`;
      }
      if (
        !Array.isArray(block.items) ||
        block.items.length === 0 ||
        !block.items.some((item) => typeof item === "string" && item.trim())
      ) {
        return `${at}: حداقل یک مورد لیست الزامی است.`;
      }
    } else if (type === "question") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `${at}: متن پرسش الزامی است.`;
      }
    } else if (type === "button") {
      if (typeof block.label !== "string" || !block.label.trim()) {
        return `${at}: برچسب دکمه الزامی است.`;
      }
      if (typeof block.href !== "string" || !block.href.trim()) {
        return `${at}: لینک دکمه الزامی است.`;
      }
    } else {
      return `${at}: نوع نامعتبر است.`;
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
        ...(variant === "outline" ? { variant } : {}),
      };
    }
    return block;
  });
}
