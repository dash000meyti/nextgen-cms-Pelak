import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import {
  type MemberRowWithRole,
  mapMemberRow,
} from "@nextgen-cms/core/db/mappers/member";
import { memberHasPermission } from "@nextgen-cms/core/db/repositories/permissions";
import {
  articleAuthors,
  articles,
  authors,
  members,
  roles,
} from "@nextgen-cms/core/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

export type MemberAdminWriteInput = {
  username: string;
  email: string | null;
  passwordHash: string | null;
  slug: string;
  name: string;
  displayRole: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  socialTwitter: string | null;
  socialTelegram: string | null;
  socialInstagram: string | null;
  roleId: number;
  isActive: boolean;
};

export type MemberAdminListRow = {
  id: number;
  slug: string;
  name: string;
  username: string;
  email: string | null;
  avatarSrc: string;
  avatarAlt: string;
  roleName: string;
  roleSlug: string;
  isActive: boolean;
  articleCount: number;
};

export type MemberAdminDetail = ReturnType<typeof mapMemberRow>;

async function memberCanReadMembers(memberId: number): Promise<boolean> {
  return (
    (await memberHasPermission(memberId, "members.create")) ||
    (await memberHasPermission(memberId, "members.edit")) ||
    (await memberHasPermission(memberId, "members.delete"))
  );
}

async function getArticleCountForAuthorId(authorId: number | null) {
  if (!authorId) return 0;

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

async function getArticleCountsByAuthorIds(
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
    .where(
      and(
        inArray(articleAuthors.authorId, authorIds),
        eq(articles.status, "published"),
      ),
    )
    .groupBy(articleAuthors.authorId);

  return new Map(rows.map((row) => [row.authorId, row.total]));
}

function authorProfileFromInput(input: MemberAdminWriteInput) {
  return {
    slug: input.slug,
    name: input.name,
    role: input.displayRole,
    bio: input.bio,
    avatarSrc: input.avatarSrc,
    avatarAlt: input.avatarAlt,
    socialTwitter: input.socialTwitter,
    socialTelegram: input.socialTelegram,
    socialInstagram: input.socialInstagram,
  };
}

async function insertAuthorRow(input: MemberAdminWriteInput) {
  const result = await db
    .insert(authors)
    .values(authorProfileFromInput(input))
    .returning({ id: authors.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert author");
  return id;
}

async function syncAuthorRow(authorId: number, input: MemberAdminWriteInput) {
  await db
    .update(authors)
    .set(authorProfileFromInput(input))
    .where(eq(authors.id, authorId));
}

export async function findAllMembersAdmin(
  access: AdminAccess,
): Promise<MemberAdminListRow[]> {
  if (!(await memberCanReadMembers(access.memberId))) {
    throw new PermissionDeniedError();
  }

  const rows = await db
    .select({
      id: members.id,
      slug: members.slug,
      name: members.name,
      username: members.username,
      email: members.email,
      avatarSrc: members.avatarSrc,
      avatarAlt: members.avatarAlt,
      isActive: members.isActive,
      legacyAuthorId: members.legacyAuthorId,
      roleName: roles.name,
      roleSlug: roles.slug,
    })
    .from(members)
    .innerJoin(roles, eq(members.roleId, roles.id))
    .orderBy(members.name);

  const authorIds = rows
    .map((row) => row.legacyAuthorId)
    .filter((id): id is number => id != null);
  const articleCounts = await getArticleCountsByAuthorIds(authorIds);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    username: row.username,
    email: row.email,
    avatarSrc: row.avatarSrc,
    avatarAlt: row.avatarAlt,
    roleName: row.roleName,
    roleSlug: row.roleSlug,
    isActive: row.isActive,
    articleCount: row.legacyAuthorId
      ? (articleCounts.get(row.legacyAuthorId) ?? 0)
      : 0,
  }));
}

export async function findMemberForAdmin(id: number, access: AdminAccess) {
  if (!(await memberCanReadMembers(access.memberId))) {
    return undefined;
  }

  const rows = await db
    .select({
      id: members.id,
      username: members.username,
      email: members.email,
      passwordHash: members.passwordHash,
      slug: members.slug,
      name: members.name,
      displayRole: members.displayRole,
      bio: members.bio,
      avatarSrc: members.avatarSrc,
      avatarAlt: members.avatarAlt,
      socialTwitter: members.socialTwitter,
      socialTelegram: members.socialTelegram,
      socialInstagram: members.socialInstagram,
      roleId: members.roleId,
      isActive: members.isActive,
      legacyAuthorId: members.legacyAuthorId,
      createdAt: members.createdAt,
      updatedAt: members.updatedAt,
      roleSlug: roles.slug,
      roleName: roles.name,
      roleIsSystem: roles.isSystem,
      roleDescription: roles.description,
    })
    .from(members)
    .innerJoin(roles, eq(members.roleId, roles.id))
    .where(eq(members.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  return mapMemberRow(row as MemberRowWithRole);
}

export async function insertMemberAdmin(
  input: MemberAdminWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "members.create");

  const now = new Date().toISOString();
  const authorId = await insertAuthorRow(input);

  const result = await db
    .insert(members)
    .values({
      username: input.username,
      email: input.email,
      passwordHash: input.passwordHash,
      slug: input.slug,
      name: input.name,
      displayRole: input.displayRole,
      bio: input.bio,
      avatarSrc: input.avatarSrc,
      avatarAlt: input.avatarAlt,
      socialTwitter: input.socialTwitter,
      socialTelegram: input.socialTelegram,
      socialInstagram: input.socialInstagram,
      roleId: input.roleId,
      isActive: input.isActive,
      legacyAuthorId: authorId,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: members.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert member");
  return id;
}

export async function updateMemberAdmin(
  id: number,
  input: MemberAdminWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "members.edit");

  const existing = await db
    .select({
      id: members.id,
      legacyAuthorId: members.legacyAuthorId,
    })
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  const row = existing[0];
  if (!row) throw new PermissionDeniedError();

  let authorId = row.legacyAuthorId;
  if (authorId) {
    await syncAuthorRow(authorId, input);
  } else {
    authorId = await insertAuthorRow(input);
  }

  await db
    .update(members)
    .set({
      username: input.username,
      email: input.email,
      ...(input.passwordHash != null
        ? { passwordHash: input.passwordHash }
        : {}),
      slug: input.slug,
      name: input.name,
      displayRole: input.displayRole,
      bio: input.bio,
      avatarSrc: input.avatarSrc,
      avatarAlt: input.avatarAlt,
      socialTwitter: input.socialTwitter,
      socialTelegram: input.socialTelegram,
      socialInstagram: input.socialInstagram,
      roleId: input.roleId,
      isActive: input.isActive,
      legacyAuthorId: authorId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));
}

export type MemberDeactivateResult = "deactivated" | "deleted";

export async function deactivateOrRemoveMember(
  id: number,
  access: AdminAccess,
): Promise<MemberDeactivateResult> {
  await assertMemberPermission(access.memberId, "members.delete");

  const existing = await db
    .select({
      id: members.id,
      legacyAuthorId: members.legacyAuthorId,
    })
    .from(members)
    .where(eq(members.id, id))
    .limit(1);

  const row = existing[0];
  if (!row) throw new PermissionDeniedError();

  const articleCount = await getArticleCountForAuthorId(row.legacyAuthorId);

  if (articleCount > 0) {
    await db
      .update(members)
      .set({
        isActive: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(members.id, id));
    return "deactivated";
  }

  if (row.legacyAuthorId) {
    await db.delete(authors).where(eq(authors.id, row.legacyAuthorId));
  }
  await db.delete(members).where(eq(members.id, id));
  return "deleted";
}
