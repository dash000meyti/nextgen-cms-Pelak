import type { ContentGroupStatus } from "@nextgen-cms/contract/content-group-status";
import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import {
  articleContentGroups,
  contentGroups,
} from "@nextgen-cms/core/db/schema";
import { contentGroupPath } from "@nextgen-cms/core/media/path-policy";
import { purgeMediaFolder } from "@nextgen-cms/core/media/purge-folder";
import { and, asc, count, eq, inArray, ne } from "drizzle-orm";

export type ContentGroupWriteInput = {
  slug: string;
  title: string;
  status: ContentGroupStatus;
  coverSrc: string;
  coverAlt: string;
  pdfSrc?: string | null;
  publishedAt: string;
};

export async function findContentGroupById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(
        access.memberId,
        "modules.contentGroup.view",
      );
    } catch {
      return undefined;
    }
  }

  const rows = await db
    .select()
    .from(contentGroups)
    .where(eq(contentGroups.id, id))
    .limit(1);
  return rows[0];
}

export async function findContentGroupBySlug(slug: string) {
  const rows = await db
    .select()
    .from(contentGroups)
    .where(eq(contentGroups.slug, slug))
    .limit(1);
  return rows[0];
}

export async function findAllContentGroupsAdmin(
  access: AdminAccess,
  options?: { status?: ContentGroupStatus | "all" },
) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.view");

  const where =
    options?.status && options.status !== "all"
      ? eq(contentGroups.status, options.status)
      : undefined;

  const query = db.select().from(contentGroups);
  const rows = where
    ? await query.where(where).orderBy(asc(contentGroups.title))
    : await query.orderBy(asc(contentGroups.title));
  return rows;
}

export async function contentGroupSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(contentGroups.slug, slug), ne(contentGroups.id, excludeId))
      : eq(contentGroups.slug, slug);
  const rows = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function findContentGroupArticleIds(
  contentGroupId: number,
): Promise<number[]> {
  const rows = await db
    .select({ articleId: articleContentGroups.articleId })
    .from(articleContentGroups)
    .where(eq(articleContentGroups.contentGroupId, contentGroupId))
    .orderBy(articleContentGroups.sortOrder);
  return rows.map((row) => row.articleId);
}

export async function setContentGroupArticleLinks(
  contentGroupId: number,
  articleIds: number[],
) {
  await db
    .delete(articleContentGroups)
    .where(eq(articleContentGroups.contentGroupId, contentGroupId));
  if (articleIds.length === 0) return;
  await db.insert(articleContentGroups).values(
    articleIds.map((articleId, index) => ({
      articleId,
      contentGroupId,
      sortOrder: index,
    })),
  );
}

function rowFromInput(input: ContentGroupWriteInput, updatedAt: string) {
  return {
    slug: input.slug,
    title: input.title,
    status: input.status,
    coverSrc: input.coverSrc,
    coverAlt: input.coverAlt,
    pdfSrc: input.pdfSrc ?? null,
    publishedAt: input.publishedAt,
    updatedAt,
  };
}

export async function insertContentGroup(
  input: ContentGroupWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.create");

  const now = new Date().toISOString();
  const result = await db
    .insert(contentGroups)
    .values({ ...rowFromInput(input, now) })
    .returning({ id: contentGroups.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert content group");
  return id;
}

export async function updateContentGroup(
  id: number,
  input: ContentGroupWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.edit");

  const existing = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(eq(contentGroups.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  const now = new Date().toISOString();
  await db
    .update(contentGroups)
    .set(rowFromInput(input, now))
    .where(eq(contentGroups.id, id));
}

export async function setContentGroupStatus(
  id: number,
  status: ContentGroupStatus,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.edit");

  const existing = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(eq(contentGroups.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  const now = new Date().toISOString();
  await db
    .update(contentGroups)
    .set({ status, updatedAt: now })
    .where(eq(contentGroups.id, id));
}

export async function deleteContentGroup(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.delete");

  const existing = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(eq(contentGroups.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await purgeMediaFolder(contentGroupPath(id));
  // junction rows cascade-delete, but explicit clear is harmless and ordered.
  await db
    .delete(articleContentGroups)
    .where(eq(articleContentGroups.contentGroupId, id));
  await db.delete(contentGroups).where(eq(contentGroups.id, id));
}

export async function countContentGroupsByStatus() {
  const rows = await db
    .select({ status: contentGroups.status, total: count() })
    .from(contentGroups)
    .groupBy(contentGroups.status);
  const counts = { draft: 0, published: 0, archived: 0 };
  for (const row of rows) {
    if (row.status === "draft") counts.draft = row.total;
    if (row.status === "published") counts.published = row.total;
    if (row.status === "archived") counts.archived = row.total;
  }
  return counts;
}

export async function findContentGroupsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select()
    .from(contentGroups)
    .where(inArray(contentGroups.id, ids));
  return rows;
}
