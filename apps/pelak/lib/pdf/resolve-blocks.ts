import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { resolvePdfImageSrc } from "@/lib/pdf/resolve-image";

export type ResolvedBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: 2 | 3 | 4; content: string }
  | { type: "quote"; content: string; attribution?: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      credit?: string;
    }
  | { type: "video"; src: string; caption?: string }
  | { type: "list"; variant: "bullet" | "ordered"; items: string[] }
  | { type: "question"; content: string; answer?: string }
  | {
      type: "button";
      label: string;
      href: string;
      variant?: "primary" | "outline";
    };

export async function resolveArticleBlocks(
  blocks: ArticleBlock[],
  siteUrl: string,
): Promise<ResolvedBlock[]> {
  return Promise.all(
    blocks.map(async (block): Promise<ResolvedBlock> => {
      if (block.type === "image") {
        return {
          type: "image",
          src: await resolvePdfImageSrc(block.image.src, siteUrl),
          alt: block.image.alt,
          ...(block.image.caption ? { caption: block.image.caption } : {}),
          ...(block.image.credit ? { credit: block.image.credit } : {}),
        };
      }
      if (block.type === "heading") {
        return {
          type: "heading",
          level: block.level,
          content: block.content,
        };
      }
      if (block.type === "video") {
        return {
          type: "video",
          src: block.src,
          ...(block.caption ? { caption: block.caption } : {}),
        };
      }
      if (block.type === "list") {
        return { type: "list", variant: block.variant, items: block.items };
      }
      if (block.type === "question") {
        return {
          type: "question",
          content: block.content,
          ...(block.answer ? { answer: block.answer } : {}),
        };
      }
      if (block.type === "button") {
        return {
          type: "button",
          label: block.label,
          href: block.href,
          ...(block.variant ? { variant: block.variant } : {}),
        };
      }
      return block;
    }),
  );
}
