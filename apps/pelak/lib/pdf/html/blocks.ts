import type { ResolvedBlock } from "@/lib/pdf/resolve-blocks";
import { escapeHtml } from "@/lib/pdf/html/escape";

export function renderBlocksHtml(blocks: ResolvedBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `<h2>${escapeHtml(block.content)}</h2>`;
      }

      if (block.type === "quote") {
        const attribution = block.attribution
          ? `<footer>— ${escapeHtml(block.attribution)}</footer>`
          : "";
        return `<blockquote><p>${escapeHtml(block.content)}</p>${attribution}</blockquote>`;
      }

      if (block.type === "image") {
        const caption = [block.caption, block.credit].filter(Boolean).join(" — ");
        const captionHtml = caption
          ? `<figcaption>${escapeHtml(caption)}</figcaption>`
          : "";
        return `<figure><img src="${block.src}" alt="${escapeHtml(block.alt)}" />${captionHtml}</figure>`;
      }

      return `<p>${escapeHtml(block.content)}</p>`;
    })
    .join("\n");
}
