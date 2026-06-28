import { db } from "@nextgen-cms/core/db";
import { mapArticleRowToPreview } from "@nextgen-cms/core/db/mappers/article";
import { loadArticleRelations } from "@nextgen-cms/core/db/repositories/articles";
import { articles, mostReadEntries } from "@nextgen-cms/core/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function findMostRead(limit = 10) {
  const entries = await db
    .select({
      articleId: mostReadEntries.articleId,
      sortOrder: mostReadEntries.sortOrder,
    })
    .from(mostReadEntries)
    .orderBy(asc(mostReadEntries.sortOrder))
    .limit(limit);

  if (entries.length === 0) return [];

  const articleIds = entries.map((entry) => entry.articleId);
  const articleRows = await db
    .select()
    .from(articles)
    .where(
      and(eq(articles.status, "published"), inArray(articles.id, articleIds)),
    );

  const withRelations = await loadArticleRelations(articleRows);
  const byId = new Map(withRelations.map((row) => [row.id, row]));

  return entries
    .map((entry) => byId.get(entry.articleId))
    .filter((row): row is NonNullable<typeof row> => row !== undefined)
    .map(mapArticleRowToPreview);
}
