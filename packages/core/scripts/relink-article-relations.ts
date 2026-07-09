import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../src/db/index";
import {
  articleAuthors,
  articleContentGroups,
  articles,
  contentGroups,
  members,
} from "../src/db/schema";
import { resolveSqlitePath } from "../src/platform/paths";

/**
 * Backfill missing article_authors / article_content_groups rows.
 *
 * - Authors: uses created_by_member_id → members.legacy_author_id
 * - Content groups: links to the latest published content group when none exist
 */
async function relinkArticleRelations() {
  const sqlitePath = resolveSqlitePath();
  console.log(`Using database at ${sqlitePath}`);

  const publishedArticles = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      createdByMemberId: articles.createdByMemberId,
    })
    .from(articles)
    .where(eq(articles.status, "published"));

  if (publishedArticles.length === 0) {
    console.log("No published articles found.");
    return;
  }

  const articleIds = publishedArticles.map((row) => row.id);

  const existingAuthorLinks = await db
    .select({ articleId: articleAuthors.articleId })
    .from(articleAuthors)
    .where(inArray(articleAuthors.articleId, articleIds));

  const articlesWithAuthors = new Set(
    existingAuthorLinks.map((row) => row.articleId),
  );

  const existingContentGroupLinks = await db
    .select({ articleId: articleContentGroups.articleId })
    .from(articleContentGroups)
    .where(inArray(articleContentGroups.articleId, articleIds));

  const articlesWithContentGroups = new Set(
    existingContentGroupLinks.map((row) => row.articleId),
  );

  const memberIds = [
    ...new Set(
      publishedArticles
        .map((row) => row.createdByMemberId)
        .filter((id): id is number => id != null),
    ),
  ];

  const memberRows =
    memberIds.length > 0
      ? await db
          .select({
            id: members.id,
            legacyAuthorId: members.legacyAuthorId,
          })
          .from(members)
          .where(inArray(members.id, memberIds))
      : [];

  const authorIdByMemberId = new Map(
    memberRows
      .filter((row) => row.legacyAuthorId != null)
      .map((row) => [row.id, row.legacyAuthorId as number]),
  );

  const latestContentGroup = await db
    .select({ id: contentGroups.id, slug: contentGroups.slug })
    .from(contentGroups)
    .where(eq(contentGroups.status, "published"))
    .orderBy(desc(contentGroups.publishedAt))
    .limit(1);

  const defaultContentGroupId = latestContentGroup[0]?.id;

  let authorLinksCreated = 0;
  let contentGroupLinksCreated = 0;

  for (const article of publishedArticles) {
    if (!articlesWithAuthors.has(article.id) && article.createdByMemberId) {
      const authorId = authorIdByMemberId.get(article.createdByMemberId);
      if (authorId) {
        await db
          .insert(articleAuthors)
          .values({
            articleId: article.id,
            authorId,
            sortOrder: 0,
          })
          .onConflictDoNothing();
        authorLinksCreated += 1;
        console.log(
          `Linked author ${authorId} → article ${article.slug} (${article.id})`,
        );
      } else {
        console.warn(
          `Skipped author link for article ${article.slug}: no legacy_author_id for member ${article.createdByMemberId}`,
        );
      }
    }

    if (!articlesWithContentGroups.has(article.id) && defaultContentGroupId) {
      await db
        .insert(articleContentGroups)
        .values({
          articleId: article.id,
          contentGroupId: defaultContentGroupId,
          sortOrder: 0,
        })
        .onConflictDoNothing();
      contentGroupLinksCreated += 1;
      console.log(
        `Linked content group ${defaultContentGroupId} → article ${article.slug} (${article.id})`,
      );
    }
  }

  console.log(
    `Done. Created ${authorLinksCreated} author link(s) and ${contentGroupLinksCreated} content-group link(s).`,
  );
}

relinkArticleRelations().catch((error) => {
  console.error(error);
  process.exit(1);
});
