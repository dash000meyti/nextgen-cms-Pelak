export type ImageMeta = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type HeadingLevel = 2 | 3 | 4;

export type ListVariant = "bullet" | "ordered";

export type ButtonVariant = "primary" | "outline";

export type ArticleBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: HeadingLevel; content: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "image"; image: ImageMeta }
  | { type: "video"; src: string; caption?: string }
  | { type: "list"; variant: ListVariant; items: string[] }
  | { type: "question"; content: string; answer?: string }
  | { type: "button"; label: string; href: string; variant?: ButtonVariant };

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
    const variant = raw.variant === "ordered" ? "ordered" : "bullet";
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
    const variant = raw.variant === "outline" ? "outline" : "primary";
    return {
      type: "button",
      label: typeof raw.label === "string" ? raw.label : "",
      href: typeof raw.href === "string" ? raw.href : "",
      ...(variant === "outline" ? { variant } : {}),
    };
  }
  return {
    type: "paragraph",
    content: typeof raw.content === "string" ? raw.content : "",
  };
}

export function normalizeArticleBlocks(blocks: unknown): ArticleBlock[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(normalizeArticleBlock);
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
  contentGroupNumber?: number;
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
  thumbnail: ImageMeta;
  publishedAt: string;
};
