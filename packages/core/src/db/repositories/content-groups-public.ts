import { db } from "@nextgen-cms/core/db";
import { mapAuthorRow } from "@nextgen-cms/core/db/mappers/author";
import {
  mapContentGroupRow,
  mapContentGroupSummaryRow,
} from "@nextgen-cms/core/db/mappers/content-group";
import { findArticlesByContentGroupId } from "@nextgen-cms/core/db/repositories/articles";
import {
  articleAuthors,
  articleContentGroups,
  articles,
  authors,
  contentGroups,
} from "@nextgen-cms/core/db/schema";
import { and, asc, count, desc, eq } from "drizzle-orm";

const published = eq(contentGroups.status, "published");

async function getAuthorArticleCount(authorId: number) {
  const rows = await db
    .select({ total: count() })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .where(
      and(
        eq(articleAuthors.authorId, authorId),
        eq(articles.status, "published"),
      ),
    );

  return rows[0]?.total ?? 0;
}

export async function findAllAuthors() {
  const rows = await db.select().from(authors).orderBy(asc(authors.name));
  const result = await Promise.all(
    rows.map(async (row) => {
      const articleCount = await getAuthorArticleCount(row.id);
      return mapAuthorRow(row, articleCount);
    }),
  );
  return result;
}

export async function findAllAuthorSlugs() {
  const rows = await db.select({ slug: authors.slug }).from(authors);
  return rows.map((row) => row.slug);
}

export async function findAuthorBySlug(slug: string) {
  const rows = await db
    .select()
    .from(authors)
    .where(eq(authors.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const articleCount = await getAuthorArticleCount(row.id);
  return mapAuthorRow(row, articleCount);
}

export async function countAuthors() {
  const rows = await db.select({ total: count() }).from(authors);
  return rows[0]?.total ?? 0;
}

async function countPublishedArticlesForGroup(contentGroupId: number) {
  const rows = await db
    .select({ total: count() })
    .from(articleContentGroups)
    .innerJoin(articles, eq(articleContentGroups.articleId, articles.id))
    .where(
      and(
        eq(articleContentGroups.contentGroupId, contentGroupId),
        eq(articles.status, "published"),
      ),
    );
  return rows[0]?.total ?? 0;
}

export async function findAllContentGroupSummaries() {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(published)
    .orderBy(desc(contentGroups.publishedAt));
  const summaries = await Promise.all(
    rows.map(async (row) => {
      const articleCount = await countPublishedArticlesForGroup(row.id);
      return mapContentGroupSummaryRow(row, articleCount);
    }),
  );
  return summaries;
}

export async function findAllContentGroupSlugs() {
  const rows = await db
    .select({ slug: contentGroups.slug })
    .from(contentGroups)
    .where(published)
    .orderBy(desc(contentGroups.publishedAt));
  return rows.map((row) => row.slug);
}

export async function findContentGroupBySlug(slug: string) {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(and(eq(contentGroups.slug, slug), published))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const groupArticles = await findArticlesByContentGroupId(row.id);
  return mapContentGroupRow(row, groupArticles);
}

export async function findContentGroupById(id: number) {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(and(eq(contentGroups.id, id), published))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const groupArticles = await findArticlesByContentGroupId(row.id);
  return mapContentGroupRow(row, groupArticles);
}

export async function findCurrentContentGroup() {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(published)
    .orderBy(desc(contentGroups.publishedAt))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("No content groups found in database");
  }

  const groupArticles = await findArticlesByContentGroupId(row.id);
  return mapContentGroupRow(row, groupArticles);
}

export async function countContentGroups() {
  const rows = await db
    .select({ total: count() })
    .from(contentGroups)
    .where(published);
  return rows[0]?.total ?? 0;
}
