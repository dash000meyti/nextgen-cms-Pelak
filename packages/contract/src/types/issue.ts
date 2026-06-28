import type { ArticlePreview, ImageMeta } from "../types/article";

export type IssueSummary = {
  number: number;
  season: string;
  year: number;
  label: string;
  cover: ImageMeta;
  publishedAt: string;
  articleCount: number;
};

export type Issue = IssueSummary & {
  articles: ArticlePreview[];
};
