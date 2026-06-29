import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { contentGroups } from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

export type ContentGroupWriteInput = {
  number: number;
  season: string;
  year: number;
  label: string;
  coverSrc: string;
  coverAlt: string;
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

export async function findAllContentGroupsAdmin(access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.view");
  return db.select().from(contentGroups).orderBy(contentGroups.number);
}

export async function contentGroupNumberExistsAdmin(
  number: number,
  excludeId?: number,
) {
  const where =
    excludeId != null
      ? and(eq(contentGroups.number, number), ne(contentGroups.id, excludeId))
      : eq(contentGroups.number, number);
  const rows = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertContentGroup(
  input: ContentGroupWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.contentGroup.create");

  const result = await db
    .insert(contentGroups)
    .values({
      number: input.number,
      season: input.season,
      year: input.year,
      label: input.label,
      coverSrc: input.coverSrc,
      coverAlt: input.coverAlt,
      publishedAt: input.publishedAt,
    })
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

  await db
    .update(contentGroups)
    .set({
      number: input.number,
      season: input.season,
      year: input.year,
      label: input.label,
      coverSrc: input.coverSrc,
      coverAlt: input.coverAlt,
      publishedAt: input.publishedAt,
    })
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

  await db.delete(contentGroups).where(eq(contentGroups.id, id));
}
