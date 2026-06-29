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
    number: row.number,
    season: row.season,
    year: row.year,
    label: row.label,
    cover: { src: row.coverSrc, alt: row.coverAlt },
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
