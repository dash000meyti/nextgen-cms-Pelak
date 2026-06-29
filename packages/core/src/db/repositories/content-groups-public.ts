import { db } from "@nextgen-cms/core/db";
import { mapAuthorRow } from "@nextgen-cms/core/db/mappers/author";
import {
  mapContentGroupRow,
  mapContentGroupSummaryRow,
} from "@nextgen-cms/core/db/mappers/content-group";
import { findArticlesByContentGroupNumber } from "@nextgen-cms/core/db/repositories/articles";
import {
  articleAuthors,
  articles,
  authors,
  contentGroups,
} from "@nextgen-cms/core/db/schema";
import { and, asc, count, desc, eq } from "drizzle-orm";

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

export async function findAllContentGroupSummaries() {
  const rows = await db
    .select()
    .from(contentGroups)
    .orderBy(desc(contentGroups.number));
  const summaries = await Promise.all(
    rows.map(async (row) => {
      const articleRows = await db
        .select({ total: count() })
        .from(articles)
        .where(
          and(
            eq(articles.contentGroupNumber, row.number),
            eq(articles.status, "published"),
          ),
        );
      return mapContentGroupSummaryRow(row, articleRows[0]?.total ?? 0);
    }),
  );
  return summaries;
}

export async function findAllContentGroupNumbers() {
  const rows = await db
    .select({ number: contentGroups.number })
    .from(contentGroups)
    .orderBy(desc(contentGroups.number));
  return rows.map((row) => row.number);
}

export async function findContentGroupByNumber(number: number) {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(eq(contentGroups.number, number))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const groupArticles = await findArticlesByContentGroupNumber(number);
  return mapContentGroupRow(row, groupArticles);
}

export async function findCurrentContentGroup() {
  const rows = await db
    .select()
    .from(contentGroups)
    .orderBy(desc(contentGroups.number))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("No content groups found in database");
  }

  const groupArticles = await findArticlesByContentGroupNumber(row.number);
  return mapContentGroupRow(row, groupArticles);
}

export async function countContentGroups() {
  const rows = await db.select({ total: count() }).from(contentGroups);
  return rows[0]?.total ?? 0;
}
