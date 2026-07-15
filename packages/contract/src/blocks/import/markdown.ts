import type { ArticleBlock, HeadingLevel } from "../../types/article";
import type { ImportWarning } from "./types";

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  ordered?: boolean;
  url?: string;
  alt?: string;
  title?: string;
  children?: MdNode[];
};

function mdText(node: MdNode): string {
  if (node.type === "text" && typeof node.value === "string") {
    return node.value;
  }
  if (node.type === "inlineCode" && typeof node.value === "string") {
    return node.value;
  }
  if (Array.isArray(node.children)) {
    return node.children.map(mdText).join("");
  }
  return "";
}

function mdHeadingLevel(depth: number): HeadingLevel {
  if (depth <= 1) return 2;
  if (depth === 2) return 3;
  return 4;
}

function htmlHeadingLevel(tag: string): HeadingLevel {
  const n = Number.parseInt(tag.slice(1), 10);
  if (n <= 2) return 2;
  if (n === 3) return 3;
  return 4;
}

function resolveImageSrc(
  raw: string,
  warnings: ImportWarning[],
  imageIndex: number,
): string {
  const src = raw.trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("/")) {
    return src;
  }
  warnings.push({
    code: "image_placeholder",
    message: `تصویر ${imageIndex} نیاز به آپلود دستی دارد.`,
  });
  return "";
}

function pushImageBlock(
  blocks: ArticleBlock[],
  warnings: ImportWarning[],
  alt: string,
  src: string,
): void {
  const imageIndex = blocks.filter((b) => b.type === "image").length + 1;
  const resolvedSrc = resolveImageSrc(src, warnings, imageIndex);
  if (!resolvedSrc && !alt.trim()) {
    alt = `تصویر ${imageIndex}`;
  }
  blocks.push({
    type: "image",
    image: {
      src: resolvedSrc,
      alt: alt.trim() || `تصویر ${imageIndex}`,
    },
  });
}

function parseAparatUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value, "https://www.aparat.com");
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "aparat.com") return null;
    const segments = url.pathname.split("/").filter(Boolean);
    const vIndex = segments.indexOf("v");
    if (vIndex >= 0 && segments[vIndex + 1]) {
      return `https://www.aparat.com/v/${segments[vIndex + 1]}`;
    }
    const hashIndex = segments.indexOf("videohash");
    if (hashIndex >= 0 && segments[hashIndex + 1]) {
      return `https://www.aparat.com/v/${segments[hashIndex + 1]}`;
    }
    const embedIndex = segments.indexOf("embed");
    if (embedIndex >= 0 && segments[embedIndex + 1]) {
      return `https://www.aparat.com/v/${segments[embedIndex + 1]}`;
    }
  } catch {
    // not a URL
  }
  return null;
}

function tryVideoFromUrl(url: string): ArticleBlock | null {
  const aparat = parseAparatUrl(url);
  if (aparat) {
    return { type: "video", src: aparat };
  }
  return null;
}

function listItemsFromNode(node: MdNode): string[] {
  if (!Array.isArray(node.children)) return [];
  return node.children
    .filter((child) => child.type === "listItem")
    .map((item) => {
      const parts = (item.children ?? [])
        .map(mdText)
        .map((t) => t.trim())
        .filter(Boolean);
      return parts.join("\n");
    })
    .filter(Boolean);
}

function tableFromNode(node: MdNode): ArticleBlock | null {
  const rows = (node.children ?? []).filter(
    (child) => child.type === "tableRow",
  );
  if (rows.length === 0) return null;

  const parsedRows = rows.map((row) =>
    (row.children ?? [])
      .filter((cell) => cell.type === "tableCell")
      .map((cell) => mdText(cell).trim()),
  );

  const headerRow = parsedRows[0] ?? [];
  const bodyRows = parsedRows.slice(1);
  const colCount = Math.max(headerRow.length, ...bodyRows.map((r) => r.length));
  if (colCount === 0) return null;

  const pad = (row: string[]) => {
    const next = [...row];
    while (next.length < colCount) next.push("");
    return next.slice(0, colCount);
  };

  return {
    type: "table",
    headers: pad(headerRow),
    rows: bodyRows.map(pad),
  };
}

function convertMdNode(
  node: MdNode,
  blocks: ArticleBlock[],
  warnings: ImportWarning[],
): void {
  switch (node.type) {
    case "heading": {
      const content = mdText(node).trim();
      if (!content) return;
      blocks.push({
        type: "heading",
        level: mdHeadingLevel(node.depth ?? 1),
        content,
      });
      return;
    }
    case "paragraph": {
      const content = mdText(node).trim();
      if (!content) return;
      blocks.push({ type: "paragraph", content });
      return;
    }
    case "blockquote": {
      const content = mdText(node).trim();
      if (!content) return;
      blocks.push({ type: "quote", content });
      return;
    }
    case "list": {
      const items = listItemsFromNode(node);
      if (items.length === 0) return;
      blocks.push({
        type: "list",
        variant: node.ordered ? "ordered" : "bullet",
        items,
      });
      return;
    }
    case "table": {
      const table = tableFromNode(node);
      if (table) blocks.push(table);
      return;
    }
    case "code": {
      const content = (node.value ?? "").trim();
      if (!content) return;
      blocks.push({ type: "paragraph", content });
      return;
    }
    case "html": {
      warnings.push({
        code: "unsupported_element",
        message: "بلوک HTML خام به پاراگراف تبدیل شد.",
      });
      const content = (node.value ?? "").replace(/<[^>]+>/g, "").trim();
      if (content) blocks.push({ type: "paragraph", content });
      return;
    }
    case "thematicBreak":
      return;
    case "image": {
      pushImageBlock(blocks, warnings, node.alt ?? "", node.url ?? "");
      return;
    }
    default:
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          convertMdNode(child, blocks, warnings);
        }
      }
  }
}

export async function parseMarkdownToBlocks(
  input: string,
): Promise<{ blocks: ArticleBlock[]; warnings: ImportWarning[] }> {
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;
  const remarkGfm = (await import("remark-gfm")).default;

  const tree = unified().use(remarkParse).use(remarkGfm).parse(input) as MdNode;

  const blocks: ArticleBlock[] = [];
  const warnings: ImportWarning[] = [];

  for (const child of tree.children ?? []) {
    if (child.type === "image") {
      pushImageBlock(blocks, warnings, child.alt ?? "", child.url ?? "");
      continue;
    }
    convertMdNode(child, blocks, warnings);
  }

  return { blocks, warnings };
}

export { htmlHeadingLevel, pushImageBlock, tryVideoFromUrl, parseAparatUrl };
