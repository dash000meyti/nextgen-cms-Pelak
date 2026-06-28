import type {
  ArticleBlock,
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

export function validateArticleBlocks(blocks: unknown): string | undefined {
  if (!Array.isArray(blocks)) return "بدنهٔ محتوا نامعتبر است.";
  if (blocks.length === 0) return "حداقل یک بلوک متن لازم است.";

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i] as Record<string, unknown>;
    const type = block.type;

    if (type === "paragraph" || type === "heading") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `بلوک ${i + 1}: محتوا الزامی است.`;
      }
    } else if (type === "quote") {
      if (typeof block.content !== "string" || !block.content.trim()) {
        return `بلوک ${i + 1}: نقل‌قول الزامی است.`;
      }
    } else if (type === "image") {
      if (!isImageMeta(block.image)) {
        return `بلوک ${i + 1}: تصویر نامعتبر است.`;
      }
      const err = validateImageMeta(
        block.image.src,
        block.image.alt,
        "تصویر بلوک",
      );
      if (err) return `بلوک ${i + 1}: ${err}`;
    } else {
      return `بلوک ${i + 1}: نوع نامعتبر است.`;
    }
  }

  return undefined;
}

export function parseArticleBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks.map((block) => {
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
    return block;
  });
}
