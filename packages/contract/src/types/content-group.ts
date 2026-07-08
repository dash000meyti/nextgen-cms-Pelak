import type { ContentGroupStatus } from "@nextgen-cms/contract/content-group-status";
import type { ArticlePreview, ImageMeta } from "../types/article";

export type ContentGroupSummary = {
  id: number;
  slug: string;
  title: string;
  status: ContentGroupStatus;
  cover: ImageMeta;
  pdfSrc?: string | null;
  publishedAt: string;
  articleCount: number;
};

export type ContentGroup = ContentGroupSummary & {
  articles: ArticlePreview[];
};
