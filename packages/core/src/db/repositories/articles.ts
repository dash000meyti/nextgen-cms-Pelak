import type { ArticleStatus } from "@nextgen-cms/contract/article-status";
import type { Permission } from "@nextgen-cms/contract/permissions";
import { db } from "@nextgen-cms/core/db";
import {
  assertMemberCanDeleteArticle,
  assertMemberCanEditArticle,
  assertMemberCanPublish,
  assertMemberHasAnyContentPermission,
  memberCanReadArticleAdmin,
  memberHasEditAllArticles,
} from "@nextgen-cms/core/db/access/article-permission";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import {
  type ArticleWithRelations,
  mapArticleRowToArticle,
  mapArticleRowToPreview,
} from "@nextgen-cms/core/db/mappers/article";
import { ensureMemberAuthorProfiles } from "@nextgen-cms/core/db/repositories/members";
import { getMemberPermissions } from "@nextgen-cms/core/db/repositories/permissions";
import {
  articleAuthors,
  articles,
  articleTopics,
  authors,
  members,
  topics,
} from "@nextgen-cms/core/db/schema";
import { daysAgoIsoIran } from "@nextgen-cms/core/platform/datetime";
import { and, count, desc, eq, inArray, isNotNull, ne, sql } from "drizzle-orm";

const published = eq(articles.status, "published");

async function getAuthorCounts(
  authorIds: number[],
): Promise<Map<number, number>> {
  if (authorIds.length === 0) return new Map();

  const rows = await db
    .select({
      authorId: articleAuthors.authorId,
      total: count(),
    })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .where(and(inArray(articleAuthors.authorId, authorIds), published))
    .groupBy(articleAuthors.authorId);

  return new Map(rows.map((row) => [row.authorId, row.total]));
}

export async function loadArticleRelations(
  articleRows: (typeof articles.$inferSelect)[],
): Promise<ArticleWithRelations[]> {
  if (articleRows.length === 0) return [];

  const articleIds = articleRows.map((row) => row.id);

  const authorLinks = await db
    .select({
      articleId: articleAuthors.articleId,
      sortOrder: articleAuthors.sortOrder,
      author: authors,
    })
    .from(articleAuthors)
    .innerJoin(authors, eq(articleAuthors.authorId, authors.id))
    .where(inArray(articleAuthors.articleId, articleIds));

  const topicLinks = await db
    .select({
      articleId: articleTopics.articleId,
      topic: topics,
    })
    .from(articleTopics)
    .innerJoin(topics, eq(articleTopics.topicId, topics.id))
    .where(inArray(articleTopics.articleId, articleIds));

  const authorIds = [...new Set(authorLinks.map((link) => link.author.id))];
  const authorCounts = await getAuthorCounts(authorIds);

  return articleRows.map((article) => ({
    ...article,
    authors: authorLinks
      .filter((link) => link.articleId === article.id)
      .map((link) => ({
        sortOrder: link.sortOrder,
        author: link.author,
        articleCount: authorCounts.get(link.author.id) ?? 0,
      })),
    topics: topicLinks
      .filter((link) => link.articleId === article.id)
      .map((link) => link.topic),
  }));
}

async function findPublishedArticles(
  whereClause?: ReturnType<typeof and>,
  limit?: number,
): Promise<ArticleWithRelations[]> {
  const query = db
    .select()
    .from(articles)
    .where(whereClause ? and(published, whereClause) : published)
    .orderBy(desc(articles.publishedAt));

  const rows = limit != null ? await query.limit(limit) : await query;
  return loadArticleRelations(rows);
}

export async function findAllArticlePreviews() {
  const rows = await findPublishedArticles();
  return rows.map(mapArticleRowToPreview);
}

export async function findAllArticleSlugs() {
  const rows = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(published);
  return rows.map((row) => row.slug);
}

export async function findPublishedArticleSitemapEntries() {
  const rows = await db
    .select({ slug: articles.slug, publishedAt: articles.publishedAt })
    .from(articles)
    .where(published);
  return rows;
}

export async function findArticleBySlug(slug: string) {
  const rows = await findPublishedArticles(eq(articles.slug, slug));
  const article = rows[0];
  return article ? mapArticleRowToArticle(article) : undefined;
}

export async function findPublishedArticleById(id: number) {
  const rows = await findPublishedArticles(eq(articles.id, id));
  const article = rows[0];
  if (!article) return undefined;
  return {
    id: article.id,
    slug: article.slug,
    article: mapArticleRowToArticle(article),
  };
}

export async function findPublishedArticleShareMetaBySlug(slug: string) {
  const rows = await db
    .select({ id: articles.id, slug: articles.slug })
    .from(articles)
    .where(and(eq(articles.slug, slug), published))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;
  return { id: row.id, slug: row.slug };
}

export async function findArticlesByTopicSlug(topicSlug: string) {
  const topicRow = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.slug, topicSlug))
    .limit(1);

  const topicId = topicRow[0]?.id;
  if (!topicId) return [];

  const articleIds = await db
    .select({ articleId: articleTopics.articleId })
    .from(articleTopics)
    .where(eq(articleTopics.topicId, topicId));

  if (articleIds.length === 0) return [];

  const rows = await findPublishedArticles(
    inArray(
      articles.id,
      articleIds.map((row) => row.articleId),
    ),
  );
  return rows.map(mapArticleRowToPreview);
}

export async function findArticlesByAuthorSlug(authorSlug: string) {
  const authorRow = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.slug, authorSlug))
    .limit(1);

  const authorId = authorRow[0]?.id;
  if (!authorId) return [];

  const articleIds = await db
    .select({ articleId: articleAuthors.articleId })
    .from(articleAuthors)
    .where(eq(articleAuthors.authorId, authorId));

  if (articleIds.length === 0) return [];

  const rows = await findPublishedArticles(
    inArray(
      articles.id,
      articleIds.map((row) => row.articleId),
    ),
  );
  return rows.map(mapArticleRowToPreview);
}

export async function findFeaturedArticles(limit = 1) {
  const rows = await findPublishedArticles(
    eq(articles.isFeatured, true),
    limit,
  );
  return rows.map(mapArticleRowToPreview);
}

export async function findEditorsPicks(limit = 3) {
  const rows = await findPublishedArticles(
    eq(articles.isEditorsPick, true),
    limit,
  );
  return rows.map(mapArticleRowToPreview);
}

export async function findArticlesByContentGroupNumber(
  contentGroupNumber: number,
) {
  const rows = await findPublishedArticles(
    eq(articles.contentGroupNumber, contentGroupNumber),
  );
  return rows.map(mapArticleRowToPreview);
}

export async function findArticlesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const rows = await findPublishedArticles(inArray(articles.slug, slugs));
  const bySlug = new Map(rows.map((row) => [row.slug, row]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((row): row is ArticleWithRelations => row !== undefined)
    .map(mapArticleRowToPreview);
}

export async function countArticlesByStatus() {
  const rows = await db
    .select({
      status: articles.status,
      total: count(),
    })
    .from(articles)
    .groupBy(articles.status);

  const counts = { draft: 0, published: 0, archived: 0 };
  for (const row of rows) {
    if (row.status === "draft") counts.draft = row.total;
    if (row.status === "published") counts.published = row.total;
    if (row.status === "archived") counts.archived = row.total;
  }
  return counts;
}

export async function countArticlesSince(days: number) {
  const cutoffIso = `${daysAgoIsoIran(days)}T00:00:00.000Z`;

  const rows = await db
    .select({ total: count() })
    .from(articles)
    .where(
      and(
        eq(articles.status, "published"),
        sql`${articles.updatedAt} >= ${cutoffIso}`,
      ),
    );

  return rows[0]?.total ?? 0;
}

export type ArticleWriteInput = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  status: (typeof articles.$inferSelect)["status"];
  publishedAt: string | null;
  readingMinutes: number;
  heroSrc: string;
  heroAlt: string;
  heroCaption: string | null;
  heroCredit: string | null;
  contentGroupNumber: number | null;
  isFeatured: boolean;
  isEditorsPick: boolean;
  body: (typeof articles.$inferSelect)["body"];
  relatedSlugs: string[];
  memberIds: number[];
  topicIds: number[];
};

export async function resolveAuthorIdsFromMemberIds(
  memberIds: number[],
): Promise<number[]> {
  return ensureMemberAuthorProfiles(memberIds);
}

export async function resolveMemberIdsFromAuthorIds(
  authorIds: number[],
): Promise<number[]> {
  if (authorIds.length === 0) return [];

  const rows = await db
    .select({
      id: members.id,
      legacyAuthorId: members.legacyAuthorId,
    })
    .from(members)
    .where(
      and(
        inArray(members.legacyAuthorId, authorIds),
        isNotNull(members.legacyAuthorId),
      ),
    );

  const byAuthorId = new Map(
    rows.map((row) => [row.legacyAuthorId as number, row.id]),
  );

  return authorIds.map((authorId) => {
    const memberId = byAuthorId.get(authorId);
    if (memberId == null) {
      throw new Error("عضو مرتبط با نویسنده یافت نشد.");
    }
    return memberId;
  });
}

export async function resolveMemberNamesByAuthorIds(
  authorIds: number[],
): Promise<Map<number, string>> {
  if (authorIds.length === 0) return new Map();

  const rows = await db
    .select({
      legacyAuthorId: members.legacyAuthorId,
      name: members.name,
    })
    .from(members)
    .where(
      and(
        inArray(members.legacyAuthorId, authorIds),
        isNotNull(members.legacyAuthorId),
      ),
    );

  return new Map(rows.map((row) => [row.legacyAuthorId as number, row.name]));
}

async function syncArticleAuthors(articleId: number, authorIds: number[]) {
  await db
    .delete(articleAuthors)
    .where(eq(articleAuthors.articleId, articleId));
  if (authorIds.length === 0) return;
  await db.insert(articleAuthors).values(
    authorIds.map((authorId, index) => ({
      articleId,
      authorId,
      sortOrder: index,
    })),
  );
}

async function syncArticleTopics(articleId: number, topicIds: number[]) {
  await db.delete(articleTopics).where(eq(articleTopics.articleId, articleId));
  if (topicIds.length === 0) return;
  await db.insert(articleTopics).values(
    topicIds.map((topicId) => ({
      articleId,
      topicId,
    })),
  );
}

function articleRowFromInput(input: ArticleWriteInput, updatedAt: string) {
  return {
    slug: input.slug,
    title: input.title,
    subtitle: input.subtitle,
    excerpt: input.excerpt,
    status: input.status,
    publishedAt: input.publishedAt,
    readingMinutes: input.readingMinutes,
    heroSrc: input.heroSrc,
    heroAlt: input.heroAlt,
    heroCaption: input.heroCaption,
    heroCredit: input.heroCredit,
    contentGroupNumber: input.contentGroupNumber,
    isFeatured: input.isFeatured,
    isEditorsPick: input.isEditorsPick,
    body: input.body,
    relatedSlugs: input.relatedSlugs,
    updatedAt,
  };
}

export async function findArticleById(id: number, access?: AdminAccess) {
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;
  const [article] = await loadArticleRelations([row]);
  if (!access) return article;

  const canRead = await memberCanReadArticleAdmin(access.memberId, article);
  if (!canRead) return undefined;
  return article;
}

export async function findArticlesForMember(
  memberId: number,
  permissions: Permission[],
  options?: {
    status?: ArticleStatus | "all";
  },
) {
  await assertMemberHasAnyContentPermission(memberId);

  const conditions = [];
  if (options?.status && options.status !== "all") {
    conditions.push(eq(articles.status, options.status));
  }

  if (!permissions.includes("content.edit_all")) {
    conditions.push(eq(articles.createdByMemberId, memberId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(articles)
    .where(where)
    .orderBy(desc(articles.updatedAt));

  return loadArticleRelations(rows);
}

export async function findAllArticlesAdmin(
  access: AdminAccess,
  options?: {
    status?: (typeof articles.$inferSelect)["status"] | "all";
  },
) {
  const permissions = await getMemberPermissions(access.memberId);
  return findArticlesForMember(access.memberId, permissions, options);
}

export async function articleSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(articles.slug, slug), ne(articles.id, excludeId))
      : eq(articles.slug, slug);
  const rows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertArticle(
  input: ArticleWriteInput,
  access: AdminAccess,
  options: { createdByMemberId: number },
) {
  await assertMemberPermission(access.memberId, "content.create");

  const editAll = await memberHasEditAllArticles(access.memberId);
  if (!editAll && options.createdByMemberId !== access.memberId) {
    throw new PermissionDeniedError();
  }

  const authorIds = await resolveAuthorIdsFromMemberIds(input.memberIds);
  const now = new Date().toISOString();
  const result = await db
    .insert(articles)
    .values({
      ...articleRowFromInput(input, now),
      createdByMemberId: options.createdByMemberId,
    })
    .returning({ id: articles.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert article");

  await syncArticleAuthors(id, authorIds);
  await syncArticleTopics(id, input.topicIds);
  return id;
}

export async function updateArticle(
  id: number,
  input: ArticleWriteInput,
  access: AdminAccess,
) {
  const existing = await findArticleById(id);
  if (!existing) {
    throw new PermissionDeniedError();
  }

  await assertMemberCanEditArticle(access.memberId, existing);

  if (input.status === "published" || input.status === "archived") {
    const wasPublished =
      existing.status === "published" || existing.status === "archived";
    const statusChanging = input.status !== existing.status;
    if (statusChanging || !wasPublished) {
      await assertMemberCanPublish(access.memberId);
    }
  }

  const now = new Date().toISOString();
  await db
    .update(articles)
    .set(articleRowFromInput(input, now))
    .where(eq(articles.id, id));

  const authorIds = await resolveAuthorIdsFromMemberIds(input.memberIds);
  await syncArticleAuthors(id, authorIds);
  await syncArticleTopics(id, input.topicIds);
}

export async function archiveArticle(
  id: number,
  access: AdminAccess,
  media: { heroSrc: string; body: ArticleWriteInput["body"] },
) {
  const existing = await findArticleById(id);
  if (!existing) {
    throw new PermissionDeniedError();
  }

  await assertMemberCanEditArticle(access.memberId, existing);

  const now = new Date().toISOString();
  await db
    .update(articles)
    .set({
      status: "archived",
      heroSrc: media.heroSrc,
      body: media.body,
      isFeatured: false,
      isEditorsPick: false,
      updatedAt: now,
    })
    .where(eq(articles.id, id));
}

export async function restoreArticleFromArchive(
  id: number,
  access: AdminAccess,
  media: { heroSrc: string; body: ArticleWriteInput["body"] },
) {
  const existing = await findArticleById(id);
  if (!existing) {
    throw new PermissionDeniedError();
  }

  await assertMemberCanEditArticle(access.memberId, existing);

  if (existing.status !== "archived") {
    throw new PermissionDeniedError("این محتوا در بایگانی نیست.");
  }

  const now = new Date().toISOString();
  await db
    .update(articles)
    .set({
      status: "draft",
      heroSrc: media.heroSrc,
      body: media.body,
      updatedAt: now,
    })
    .where(eq(articles.id, id));
}

export async function deleteArticle(id: number, access: AdminAccess) {
  const existing = await findArticleById(id);
  if (!existing) {
    throw new PermissionDeniedError();
  }

  if (existing.status !== "archived") {
    throw new PermissionDeniedError(
      "فقط محتوای بایگانی‌شده قابل حذف دائمی است.",
    );
  }

  await assertMemberCanDeleteArticle(access.memberId, existing);

  await db.delete(articles).where(eq(articles.id, id));
}

export async function findRecentArticlesForAdmin(
  access: AdminAccess,
  limit = 8,
) {
  const permissions = await getMemberPermissions(access.memberId);
  await assertMemberHasAnyContentPermission(access.memberId);

  const editAll = permissions.includes("content.edit_all");
  const where = editAll
    ? undefined
    : eq(articles.createdByMemberId, access.memberId);

  const rows = await db
    .select({
      id: articles.id,
      slug: articles.slug,
      title: articles.title,
      status: articles.status,
      publishedAt: articles.publishedAt,
      updatedAt: articles.updatedAt,
    })
    .from(articles)
    .where(where)
    .orderBy(desc(articles.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  }));
}

export async function findArticleIdsByCreator(
  memberId: number,
): Promise<number[]> {
  const rows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.createdByMemberId, memberId));
  return rows.map((row) => row.id);
}

export async function findArticleStatusById(
  id: number,
): Promise<ArticleStatus | null> {
  const [row] = await db
    .select({ status: articles.status })
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);
  return row?.status ?? null;
}
