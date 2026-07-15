import { type ArticleBlock, normalizeArticleBlock } from "../../types/article";
import { detectImportFormat } from "./detect";
import { parseHtmlToBlocks } from "./html";
import { parseMarkdownToBlocks } from "./markdown";
import { parsePlainToBlocks } from "./plain";
import type { ImportOptions, ImportResult, ImportWarning } from "./types";

function isEmptyBlock(block: ArticleBlock): boolean {
  if (block.type === "paragraph") return !block.content.trim();
  if (block.type === "heading") return !block.content.trim();
  if (block.type === "quote") return !block.content.trim();
  if (block.type === "list") {
    return !block.items.some((item) => item.trim());
  }
  if (block.type === "image") return false;
  if (block.type === "question") return !block.content.trim();
  if (block.type === "table") {
    return (
      !block.headers.some((h) => h.trim()) &&
      !block.rows.some((row) => row.some((c) => c.trim()))
    );
  }
  if (block.type === "button") {
    return !block.label.trim() && !block.href.trim();
  }
  if (block.type === "video") return !block.src.trim();
  return false;
}

function finalizeBlocks(blocks: ArticleBlock[]): ArticleBlock[] {
  return blocks
    .map((block) => normalizeArticleBlock(block))
    .filter((block) => !isEmptyBlock(block));
}

export async function importBlocksFromText(
  input: string,
  options: ImportOptions = {},
): Promise<ImportResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      format: "plain",
      blocks: [],
      warnings: [
        {
          code: "empty_input",
          message: "متنی برای وارد کردن وجود ندارد.",
        },
      ],
    };
  }

  const format =
    options.format === "auto" || !options.format
      ? detectImportFormat(trimmed)
      : options.format;

  let blocks: ArticleBlock[] = [];
  let warnings: ImportWarning[] = [];

  if (format === "html") {
    ({ blocks, warnings } = parseHtmlToBlocks(trimmed));
  } else if (format === "markdown") {
    ({ blocks, warnings } = await parseMarkdownToBlocks(trimmed));
  } else {
    blocks = parsePlainToBlocks(trimmed);
  }

  return {
    format,
    blocks: finalizeBlocks(blocks),
    warnings,
  };
}

/** Import when clipboard provides separate HTML and plain text. */
export async function importBlocksFromClipboard(
  html: string | undefined,
  plain: string | undefined,
): Promise<ImportResult> {
  const htmlTrimmed = html?.trim() ?? "";
  if (htmlTrimmed && /<\/?[a-z]/i.test(htmlTrimmed)) {
    const { blocks, warnings } = parseHtmlToBlocks(htmlTrimmed);
    return {
      format: "html",
      blocks: finalizeBlocks(blocks),
      warnings,
    };
  }

  const plainTrimmed = plain?.trim() ?? "";
  return importBlocksFromText(plainTrimmed);
}

export type {
  ImportFormat,
  ImportOptions,
  ImportResult,
  ImportWarning,
  ImportWarningCode,
} from "./types";
