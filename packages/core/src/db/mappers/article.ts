import type {
  Article,
  ArticleBlock,
  ArticlePreview,
  Author,
  ImageMeta,
  Topic,
} from "@nextgen-cms/contract/types/article";
import { mapAuthorRow } from "@nextgen-cms/core/db/mappers/author";
import { mapTopicRow } from "@nextgen-cms/core/db/mappers/topic";
import type { ArticleRow } from "@nextgen-cms/core/db/schema/articles";
import type { AuthorRow } from "@nextgen-cms/core/db/schema/authors";
import type { TopicRow } from "@nextgen-cms/core/db/schema/topics";

export type ArticleWithRelations = ArticleRow & {
  authors: Array<{
    sortOrder: number;
    author: AuthorRow;
    articleCount: number;
  }>;
  topics: TopicRow[];
};

function mapHero(row: ArticleRow): ImageMeta {
  return {
    src: row.heroSrc,
    alt: row.heroAlt,
    ...(row.heroCaption ? { caption: row.heroCaption } : {}),
    ...(row.heroCredit ? { credit: row.heroCredit } : {}),
  };
}

function mapAuthors(relations: ArticleWithRelations["authors"]): Author[] {
  return [...relations]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((link) => mapAuthorRow(link.author, link.articleCount));
}

function mapTopics(relations: ArticleWithRelations["topics"]): Topic[] {
  return relations.map(mapTopicRow);
}

function mapPreviewFields(row: ArticleWithRelations): ArticlePreview {
  return {
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    authors: mapAuthors(row.authors),
    publishedAt: row.publishedAt ?? "",
    topics: mapTopics(row.topics),
    readingMinutes: row.readingMinutes,
    heroImage: mapHero(row),
    ...(row.issueNumber != null ? { issueNumber: row.issueNumber } : {}),
    ...(row.isFeatured ? { isFeatured: true } : {}),
    ...(row.isEditorsPick ? { isEditorsPick: true } : {}),
  };
}

export function mapArticleRowToPreview(
  row: ArticleWithRelations,
): ArticlePreview {
  return mapPreviewFields(row);
}

export function mapArticleRowToArticle(row: ArticleWithRelations): Article {
  const body =
    typeof row.body === "string"
      ? (JSON.parse(row.body) as ArticleWithRelations["body"])
      : row.body;
  const relatedSlugs =
    typeof row.relatedSlugs === "string"
      ? (JSON.parse(row.relatedSlugs) as string[])
      : row.relatedSlugs;

  return {
    ...mapPreviewFields(row),
    body: body ?? [],
    relatedSlugs: relatedSlugs ?? [],
  };
}

export type { ArticleBlock };
