import type { ArticlePreview, ImageMeta } from "../types/article";

export type ContentGroupSummary = {
  number: number;
  season: string;
  year: number;
  label: string;
  cover: ImageMeta;
  publishedAt: string;
  articleCount: number;
};

export type ContentGroup = ContentGroupSummary & {
  articles: ArticlePreview[];
};
