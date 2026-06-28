import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { memberHasPermission } from "@nextgen-cms/core/db/repositories/permissions";
import { authors } from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

export type AuthorWriteInput = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  socialTwitter: string | null;
  socialTelegram: string | null;
  socialInstagram: string | null;
};

async function memberCanReadAuthors(memberId: number): Promise<boolean> {
  return (
    (await memberHasPermission(memberId, "members.create")) ||
    (await memberHasPermission(memberId, "members.edit")) ||
    (await memberHasPermission(memberId, "members.delete"))
  );
}

export async function findAuthorById(id: number, access?: AdminAccess) {
  if (access && !(await memberCanReadAuthors(access.memberId))) {
    return undefined;
  }

  const rows = await db
    .select()
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);
  return rows[0];
}

export async function findAllAuthorsAdmin(access: AdminAccess) {
  if (!(await memberCanReadAuthors(access.memberId))) {
    throw new PermissionDeniedError();
  }

  return db.select().from(authors).orderBy(authors.name);
}

export async function authorSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(authors.slug, slug), ne(authors.id, excludeId))
      : eq(authors.slug, slug);
  const rows = await db
    .select({ id: authors.id })
    .from(authors)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertAuthor(
  input: AuthorWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "members.create");

  const result = await db
    .insert(authors)
    .values({
      slug: input.slug,
      name: input.name,
      role: input.role,
      bio: input.bio,
      avatarSrc: input.avatarSrc,
      avatarAlt: input.avatarAlt,
      socialTwitter: input.socialTwitter,
      socialTelegram: input.socialTelegram,
      socialInstagram: input.socialInstagram,
    })
    .returning({ id: authors.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert author");
  return id;
}

export async function updateAuthor(
  id: number,
  input: AuthorWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "members.edit");

  const existing = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db
    .update(authors)
    .set({
      slug: input.slug,
      name: input.name,
      role: input.role,
      bio: input.bio,
      avatarSrc: input.avatarSrc,
      avatarAlt: input.avatarAlt,
      socialTwitter: input.socialTwitter,
      socialTelegram: input.socialTelegram,
      socialInstagram: input.socialInstagram,
    })
    .where(eq(authors.id, id));
}

export async function deleteAuthor(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "members.delete");

  const existing = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.delete(authors).where(eq(authors.id, id));
}
