import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { topics } from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

export type TopicWriteInput = {
  slug: string;
  name: string;
  description: string;
};

export async function findTopicById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(access.memberId, "settings.content");
    } catch {
      return undefined;
    }
  }

  const rows = await db.select().from(topics).where(eq(topics.id, id)).limit(1);
  return rows[0];
}

export async function findAllTopicsAdmin(access: AdminAccess) {
  await assertMemberPermission(access.memberId, "settings.content");
  return db.select().from(topics).orderBy(topics.name);
}

export async function topicSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(topics.slug, slug), ne(topics.id, excludeId))
      : eq(topics.slug, slug);
  const rows = await db
    .select({ id: topics.id })
    .from(topics)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertTopic(input: TopicWriteInput, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "settings.content");

  const result = await db
    .insert(topics)
    .values({
      slug: input.slug,
      name: input.name,
      description: input.description,
    })
    .returning({ id: topics.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert topic");
  return id;
}

export async function updateTopic(
  id: number,
  input: TopicWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "settings.content");

  const existing = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db
    .update(topics)
    .set({
      slug: input.slug,
      name: input.name,
      description: input.description,
    })
    .where(eq(topics.id, id));
}

export async function deleteTopic(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "settings.content");

  const existing = await db
    .select({ id: topics.id })
    .from(topics)
    .where(eq(topics.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.delete(topics).where(eq(topics.id, id));
}
