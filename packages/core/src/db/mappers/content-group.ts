import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import type {
  ContentGroup,
  ContentGroupSummary,
} from "@nextgen-cms/contract/types/content-group";
import type { ContentGroupRow } from "@nextgen-cms/core/db/schema/content-groups";

export function mapContentGroupSummaryRow(
  row: ContentGroupRow,
  articleCount: number,
): ContentGroupSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    cover: { src: row.coverSrc, alt: row.coverAlt },
    pdfSrc: row.pdfSrc,
    publishedAt: row.publishedAt,
    articleCount,
  };
}

export function mapContentGroupRow(
  row: ContentGroupRow,
  articles: ArticlePreview[],
): ContentGroup {
  return {
    ...mapContentGroupSummaryRow(row, articles.length),
    articles,
  };
}
