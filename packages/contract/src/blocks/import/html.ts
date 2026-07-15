import { parseHTML } from "linkedom";
import type { ArticleBlock } from "../../types/article";
import { htmlHeadingLevel, pushImageBlock, tryVideoFromUrl } from "./markdown";
import { parsePlainToBlocks } from "./plain";
import { sanitizeImportHtml } from "./sanitize";
import { collapseWhitespace } from "./text";
import type { ImportWarning } from "./types";

type DomElement = {
  tagName: string;
  getAttribute(name: string): string | null;
  textContent: string | null;
  children: DomElement[];
  childNodes: DomElement[];
  querySelector(selectors: string): DomElement | null;
  querySelectorAll(selectors: string): DomElement[];
};

const BLOCK_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "BLOCKQUOTE",
  "UL",
  "OL",
  "TABLE",
  "IMG",
  "HR",
  "PRE",
  "DETAILS",
  "FIGURE",
  "DIV",
  "SECTION",
  "ARTICLE",
]);

function elementText(el: DomElement): string {
  return collapseWhitespace(el.textContent ?? "");
}

function listItemsFromList(el: DomElement): string[] {
  const items: string[] = [];
  for (const child of el.children) {
    if (child.tagName === "LI") {
      const text = elementText(child);
      if (text) items.push(text);
      for (const nested of child.children) {
        if (nested.tagName === "UL" || nested.tagName === "OL") {
          for (const nestedLi of nested.children) {
            if (nestedLi.tagName === "LI") {
              const nestedText = elementText(nestedLi);
              if (nestedText) items.push(nestedText);
            }
          }
        }
      }
    }
  }
  return items;
}

function tableFromElement(el: DomElement): ArticleBlock | null {
  const rows: string[][] = [];
  const rowEls = el.querySelectorAll("tr");
  for (const row of rowEls) {
    const cells = [...row.querySelectorAll("th, td")].map((cell) =>
      elementText(cell as DomElement),
    );
    if (cells.length > 0) rows.push(cells);
  }
  if (rows.length === 0) return null;

  const colCount = Math.max(...rows.map((r) => r.length));
  const pad = (row: string[]) => {
    const next = [...row];
    while (next.length < colCount) next.push("");
    return next.slice(0, colCount);
  };

  return {
    type: "table",
    headers: pad(rows[0] ?? []),
    rows: rows.slice(1).map(pad),
  };
}

function isBlockElement(el: DomElement): boolean {
  return BLOCK_TAGS.has(el.tagName);
}

function processElement(
  el: DomElement,
  blocks: ArticleBlock[],
  warnings: ImportWarning[],
): void {
  const tag = el.tagName;

  if (tag === "HR" || tag === "BR") return;

  if (/^H[1-6]$/.test(tag)) {
    const content = elementText(el);
    if (!content) return;
    blocks.push({
      type: "heading",
      level: htmlHeadingLevel(tag.toLowerCase()),
      content,
    });
    return;
  }

  if (tag === "P") {
    const content = elementText(el);
    if (!content) return;
    const links = [...el.querySelectorAll("a")];
    if (links.length === 1 && content === elementText(links[0] as DomElement)) {
      const href = links[0]?.getAttribute("href") ?? "";
      const video = href ? tryVideoFromUrl(href) : null;
      if (video) {
        blocks.push(video);
        return;
      }
      if (href) {
        blocks.push({
          type: "button",
          label: content,
          href,
        });
        return;
      }
    }
    blocks.push({ type: "paragraph", content });
    return;
  }

  if (tag === "BLOCKQUOTE") {
    const cite = el.querySelector("cite, footer");
    const content = cite
      ? elementText(el)
          .replace(elementText(cite as DomElement), "")
          .trim()
      : elementText(el);
    if (!content) return;
    const attribution = cite ? elementText(cite as DomElement) : undefined;
    blocks.push({
      type: "quote",
      content,
      ...(attribution ? { attribution } : {}),
    });
    return;
  }

  if (tag === "UL" || tag === "OL") {
    const items = listItemsFromList(el);
    if (items.length === 0) return;
    blocks.push({
      type: "list",
      variant: tag === "OL" ? "ordered" : "bullet",
      items,
    });
    return;
  }

  if (tag === "TABLE") {
    const table = tableFromElement(el);
    if (table) blocks.push(table);
    return;
  }

  if (tag === "IMG") {
    const src = el.getAttribute("src") ?? "";
    const alt = el.getAttribute("alt") ?? el.getAttribute("title") ?? "";
    pushImageBlock(blocks, warnings, alt, src);
    return;
  }

  if (tag === "IFRAME") {
    const src = el.getAttribute("src") ?? "";
    const video = tryVideoFromUrl(src);
    if (video) {
      blocks.push(video);
      return;
    }
    warnings.push({
      code: "unsupported_element",
      message: "iframe غیرپشتیبانی‌شده نادیده گرفته شد.",
    });
    return;
  }

  if (tag === "PRE" || tag === "CODE") {
    const content = elementText(el);
    if (!content) return;
    blocks.push({ type: "paragraph", content });
    return;
  }

  if (tag === "DETAILS") {
    const summary = el.querySelector("summary");
    const question = summary
      ? elementText(summary as DomElement)
      : elementText(el);
    const answerEl = el.querySelector("p, div");
    const answer = answerEl ? elementText(answerEl as DomElement) : undefined;
    if (!question) return;
    blocks.push({
      type: "question",
      content: question,
      ...(answer ? { answer } : {}),
    });
    return;
  }

  if (tag === "FIGURE") {
    const img = el.querySelector("img");
    const caption = el.querySelector("figcaption");
    if (img) {
      const src = img.getAttribute("src") ?? "";
      const alt =
        img.getAttribute("alt") ??
        img.getAttribute("title") ??
        (caption ? elementText(caption as DomElement) : "");
      pushImageBlock(blocks, warnings, alt, src);
      return;
    }
  }

  if (tag === "DIV" || tag === "SECTION" || tag === "ARTICLE") {
    const blockChildren = el.children.filter((child) => isBlockElement(child));
    if (blockChildren.length > 0) {
      for (const child of blockChildren) {
        processElement(child, blocks, warnings);
      }
      return;
    }
    const content = elementText(el);
    if (!content) return;
    blocks.push({ type: "paragraph", content });
    return;
  }

  const content = elementText(el);
  if (content) {
    warnings.push({
      code: "unsupported_element",
      message: `عنصر <${tag.toLowerCase()}> به پاراگراف تبدیل شد.`,
    });
    blocks.push({ type: "paragraph", content });
  }
}

function wrapHtmlForParse(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";
  if (/<html[\s>]/i.test(trimmed)) {
    return trimmed.startsWith("<!DOCTYPE")
      ? trimmed
      : `<!DOCTYPE html>${trimmed}`;
  }
  if (/<body[\s>]/i.test(trimmed)) {
    return `<!DOCTYPE html><html>${trimmed}</html>`;
  }
  return `<!DOCTYPE html><html><body>${trimmed}</body></html>`;
}

function stripTags(html: string): string {
  return collapseWhitespace(html.replace(/<[^>]+>/g, " "));
}

function collectRootElements(document: {
  body: { children: Iterable<unknown> } | null;
  documentElement?: { children: Iterable<unknown> } | null;
}): DomElement[] {
  const body = document.body;
  if (body) {
    return [...body.children]
      .map((child) => child as DomElement)
      .filter((child) => child.tagName !== "SCRIPT");
  }

  const root = document.documentElement;
  if (root) {
    return [...root.children]
      .map((child) => child as DomElement)
      .filter(
        (child) => child.tagName !== "SCRIPT" && child.tagName !== "HEAD",
      );
  }

  return [];
}

export function parseHtmlToBlocks(input: string): {
  blocks: ArticleBlock[];
  warnings: ImportWarning[];
} {
  const cleaned = sanitizeImportHtml(input);
  if (!cleaned) return { blocks: [], warnings: [] };

  const blocks: ArticleBlock[] = [];
  const warnings: ImportWarning[] = [];

  try {
    const { document } = parseHTML(wrapHtmlForParse(cleaned));
    for (const el of collectRootElements(document)) {
      processElement(el as DomElement, blocks, warnings);
    }
  } catch {
    warnings.push({
      code: "unsupported_element",
      message: "HTML نامعتبر بود — متن به پاراگراف تبدیل شد.",
    });
    return {
      blocks: parsePlainToBlocks(stripTags(cleaned)),
      warnings,
    };
  }

  if (blocks.length === 0) {
    const plain = stripTags(cleaned);
    if (plain) {
      warnings.push({
        code: "unsupported_element",
        message: "ساختار HTML شناسایی نشد — متن به پاراگراف تبدیل شد.",
      });
      return { blocks: parsePlainToBlocks(plain), warnings };
    }
  }

  return { blocks, warnings };
}
