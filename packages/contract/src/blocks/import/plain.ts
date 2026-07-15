import type { ArticleBlock } from "../../types/article";
import { collapseWhitespace } from "./text";

export function parsePlainToBlocks(input: string): ArticleBlock[] {
  const normalized = input.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks = normalized.split(/\n{2,}/);
  const blocks: ArticleBlock[] = [];

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((line) => collapseWhitespace(line))
      .filter(Boolean);
    if (lines.length === 0) continue;
    blocks.push({
      type: "paragraph",
      content: lines.join("\n"),
    });
  }

  return blocks;
}
