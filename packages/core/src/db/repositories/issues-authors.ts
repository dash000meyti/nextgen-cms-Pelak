import { db } from "@nextgen-cms/core/db";
import { mapAuthorRow } from "@nextgen-cms/core/db/mappers/author";
import {
  mapIssueRow,
  mapIssueSummaryRow,
} from "@nextgen-cms/core/db/mappers/issue";
import { findArticlesByIssueNumber } from "@nextgen-cms/core/db/repositories/articles";
import {
  articleAuthors,
  articles,
  authors,
  issues,
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

export async function findAllIssueSummaries() {
  const rows = await db.select().from(issues).orderBy(desc(issues.number));
  const summaries = await Promise.all(
    rows.map(async (row) => {
      const articleRows = await db
        .select({ total: count() })
        .from(articles)
        .where(
          and(
            eq(articles.issueNumber, row.number),
            eq(articles.status, "published"),
          ),
        );
      return mapIssueSummaryRow(row, articleRows[0]?.total ?? 0);
    }),
  );
  return summaries;
}

export async function findAllIssueNumbers() {
  const rows = await db
    .select({ number: issues.number })
    .from(issues)
    .orderBy(desc(issues.number));
  return rows.map((row) => row.number);
}

export async function findIssueByNumber(number: number) {
  const rows = await db
    .select()
    .from(issues)
    .where(eq(issues.number, number))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const issueArticles = await findArticlesByIssueNumber(number);
  return mapIssueRow(row, issueArticles);
}

export async function findCurrentIssue() {
  const rows = await db
    .select()
    .from(issues)
    .orderBy(desc(issues.number))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("No issues found in database");
  }

  const issueArticles = await findArticlesByIssueNumber(row.number);
  return mapIssueRow(row, issueArticles);
}

export async function countIssues() {
  const rows = await db.select({ total: count() }).from(issues);
  return rows[0]?.total ?? 0;
}
