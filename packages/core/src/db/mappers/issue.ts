import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import type { Issue, IssueSummary } from "@nextgen-cms/contract/types/issue";
import type { IssueRow } from "@nextgen-cms/core/db/schema/issues";

export function mapIssueSummaryRow(
  row: IssueRow,
  articleCount: number,
): IssueSummary {
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

export function mapIssueRow(row: IssueRow, articles: ArticlePreview[]): Issue {
  return {
    ...mapIssueSummaryRow(row, articles.length),
    articles,
  };
}
