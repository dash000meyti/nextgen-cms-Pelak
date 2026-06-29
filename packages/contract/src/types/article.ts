export type ImageMeta = {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
};

export type ArticleBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "quote"; content: string; attribution?: string }
  | { type: "image"; image: ImageMeta };

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
