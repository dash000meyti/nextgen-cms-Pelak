import type { ContentGroupSummary } from "./content-group";

export type ImageMeta = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type HeadingLevel = 2 | 3 | 4;

export type ListVariant = "bullet" | "ordered" | "dash";

export type ButtonVariant = "primary" | "outline" | "secondary";

export type ArticleBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: HeadingLevel; content: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "image"; image: ImageMeta }
  | { type: "video"; src: string; caption?: string }
  | { type: "list"; variant: ListVariant; items: string[] }
  | { type: "question"; content: string; answer?: string }
  | { type: "button"; label: string; href: string; variant?: ButtonVariant }
  | { type: "table"; headers: string[]; rows: string[][] };

export type BlockType = ArticleBlock["type"];

/**
 * Normalizes a potentially-legacy block into the current ArticleBlock shape.
 * - heading without level -> level 2
 * - list with non-array items -> items []
 * - strips unknown fields defensively
 * Keeps the JSON body backward-compatible without a DB migration.
 */
export function normalizeArticleBlock(block: unknown): ArticleBlock {
  if (!block || typeof block !== "object") {
    return { type: "paragraph", content: "" };
  }
  const raw = block as Record<string, unknown>;
  const type = raw.type;

  if (type === "heading") {
    const level = raw.level;
    return {
      type: "heading",
      level: level === 3 ? 3 : level === 4 ? 4 : 2,
      content: typeof raw.content === "string" ? raw.content : "",
    };
  }
  if (type === "quote") {
    return {
      type: "quote",
      content: typeof raw.content === "string" ? raw.content : "",
      ...(typeof raw.attribution === "string" && raw.attribution.trim()
        ? { attribution: raw.attribution }
        : {}),
    };
  }
  if (type === "image") {
    const image = raw.image as Record<string, unknown> | undefined;
    return {
      type: "image",
      image: {
        src: typeof image?.src === "string" ? image.src : "",
        alt: typeof image?.alt === "string" ? image.alt : "",
        ...(typeof image?.caption === "string" && image.caption
          ? { caption: image.caption }
          : {}),
        ...(typeof image?.credit === "string" && image.credit
          ? { credit: image.credit }
          : {}),
      },
    };
  }
  if (type === "video") {
    return {
      type: "video",
      src: typeof raw.src === "string" ? raw.src : "",
      ...(typeof raw.caption === "string" && raw.caption.trim()
        ? { caption: raw.caption }
        : {}),
    };
  }
  if (type === "list") {
    const items = Array.isArray(raw.items)
      ? raw.items.filter((item) => typeof item === "string")
      : [];
    const variant =
      raw.variant === "ordered"
        ? "ordered"
        : raw.variant === "dash"
          ? "dash"
          : "bullet";
    return { type: "list", variant, items };
  }
  if (type === "question") {
    return {
      type: "question",
      content: typeof raw.content === "string" ? raw.content : "",
      ...(typeof raw.answer === "string" && raw.answer.trim()
        ? { answer: raw.answer }
        : {}),
    };
  }
  if (type === "button") {
    const variant =
      raw.variant === "primary"
        ? "primary"
        : raw.variant === "secondary"
          ? "secondary"
          : "outline";
    return {
      type: "button",
      label: typeof raw.label === "string" ? raw.label : "",
      href: typeof raw.href === "string" ? raw.href : "",
      ...(variant !== "outline" ? { variant } : {}),
    };
  }
  if (type === "table") {
    return normalizeTableBlock(raw);
  }
  return {
    type: "paragraph",
    content: typeof raw.content === "string" ? raw.content : "",
  };
}

function normalizeTableBlock(
  raw: Record<string, unknown>,
): Extract<ArticleBlock, { type: "table" }> {
  const rawHeaders = Array.isArray(raw.headers)
    ? raw.headers.filter((h): h is string => typeof h === "string")
    : [];
  const colCount = Math.max(rawHeaders.length, 1);
  const headers =
    rawHeaders.length >= colCount
      ? rawHeaders.slice(0, colCount)
      : [...rawHeaders, ...Array(colCount - rawHeaders.length).fill("")];

  const rawRows = Array.isArray(raw.rows) ? raw.rows : [[]];
  const rows =
    rawRows.length > 0
      ? rawRows.map((row) => {
          const cells = Array.isArray(row)
            ? row.filter((c): c is string => typeof c === "string")
            : [];
          if (cells.length === colCount) return cells;
          if (cells.length > colCount) return cells.slice(0, colCount);
          return [...cells, ...Array(colCount - cells.length).fill("")];
        })
      : [Array(colCount).fill("")];

  return { type: "table", headers, rows };
}

export function normalizeArticleBlocks(blocks: unknown): ArticleBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(normalizeArticleBlock);
}

/** Join readable body text for metrics (reading time, search, etc.). */
export function articleBodyPlainText(blocks: ArticleBlock[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
      case "heading":
        if (block.content) parts.push(block.content);
        break;
      case "quote":
        if (block.content) parts.push(block.content);
        if (block.attribution) parts.push(block.attribution);
        break;
      case "list":
        for (const item of block.items) {
          if (item) parts.push(item);
        }
        break;
      case "question":
        if (block.content) parts.push(block.content);
        if (block.answer) parts.push(block.answer);
        break;
      case "image":
        if (block.image.alt) parts.push(block.image.alt);
        if (block.image.caption) parts.push(block.image.caption);
        if (block.image.credit) parts.push(block.image.credit);
        break;
      case "video":
        if (block.caption) parts.push(block.caption);
        break;
      case "button":
        break;
      case "table":
        for (const header of block.headers) {
          if (header) parts.push(header);
        }
        for (const row of block.rows) {
          for (const cell of row) {
            if (cell) parts.push(cell);
          }
        }
        break;
    }
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

const WORDS_PER_MINUTE = 200;

/** Estimate reading minutes from body blocks (Persian-friendly WPM). Min 1. */
export function estimateReadingMinutes(blocks: ArticleBlock[]): number {
  const text = articleBodyPlainText(blocks);
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export type Author = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatar: ImageMeta;
  social?: {
    twitter?: string;
    telegram?: string;
    instagram?: string;
  };
  articleCount: number;
};

export type Topic = {
  slug: string;
  name: string;
  description: string;
  showOnHomepage: boolean;
};

export type ArticlePreview = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  authors: Author[];
  publishedAt: string;
  topics: Topic[];
  readingMinutes: number;
  heroImage: ImageMeta;
  contentGroups?: ContentGroupSummary[];
  isFeatured?: boolean;
  isEditorsPick?: boolean;
};

export type Article = ArticlePreview & {
  body: ArticleBlock[];
  relatedSlugs: string[];
};

export type Video = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  status: "draft" | "published" | "archived";
  linkSource: "thumbnail" | "aparat";
  externalLink: string;
  aparatUrl?: string;
  thumbnail: ImageMeta;
  publishedAt: string;
  playlists: Playlist[];
};

export type Playlist = {
  slug: string;
  name: string;
  description: string;
  cover: ImageMeta;
};
