import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { resolvePdfImageSrc } from "@/lib/pdf/resolve-image";

export type ResolvedBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "quote"; content: string; attribution?: string }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
      credit?: string;
    };

export async function resolveArticleBlocks(
  blocks: ArticleBlock[],
  siteUrl: string,
): Promise<ResolvedBlock[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (block.type === "image") {
        return {
          type: "image" as const,
          src: await resolvePdfImageSrc(block.image.src, siteUrl),
          alt: block.image.alt,
          ...(block.image.caption ? { caption: block.image.caption } : {}),
          ...(block.image.credit ? { credit: block.image.credit } : {}),
        };
      }
      return block;
    }),
  );
}
