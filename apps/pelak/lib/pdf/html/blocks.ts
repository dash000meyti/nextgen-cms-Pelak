import { escapeHtml } from "@/lib/pdf/html/escape";
import type { ResolvedBlock } from "@/lib/pdf/resolve-blocks";

export function renderBlocksHtml(blocks: ResolvedBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        const tag = block.level === 4 ? "h4" : block.level === 3 ? "h3" : "h2";
        return `<${tag}>${escapeHtml(block.content)}</${tag}>`;
      }

      if (block.type === "quote") {
        const attribution = block.attribution
          ? `<footer>— ${escapeHtml(block.attribution)}</footer>`
          : "";
        return `<blockquote><p>${escapeHtml(block.content)}</p>${attribution}</blockquote>`;
      }

      if (block.type === "image") {
        const caption = [block.caption, block.credit]
          .filter(Boolean)
          .join(" — ");
        const captionHtml = caption
          ? `<figcaption>${escapeHtml(caption)}</figcaption>`
          : "";
        return `<figure><img src="${block.src}" alt="${escapeHtml(block.alt)}" />${captionHtml}</figure>`;
      }

      if (block.type === "video") {
        const caption = block.caption
          ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
          : "";
        return `<figure><a href="${escapeHtml(block.src)}">ویدیو</a>${caption}</figure>`;
      }

      if (block.type === "list") {
        const tag = block.variant === "ordered" ? "ol" : "ul";
        const items = block.items
          .filter((item) => item.trim())
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("");
        return `<${tag}>${items}</${tag}>`;
      }

      if (block.type === "question") {
        const answer = block.answer ? `<p>${escapeHtml(block.answer)}</p>` : "";
        return `<details><summary>${escapeHtml(block.content)}</summary>${answer}</details>`;
      }

      if (block.type === "button") {
        return `<p><a href="${escapeHtml(block.href)}">${escapeHtml(block.label)}</a></p>`;
      }

      return `<p>${escapeHtml(block.content)}</p>`;
    })
    .join("\n");
}
