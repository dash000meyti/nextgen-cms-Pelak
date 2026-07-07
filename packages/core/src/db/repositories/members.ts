import type { Permission } from "@nextgen-cms/contract/permissions";
import { db } from "@nextgen-cms/core/db";
import {
  type MemberRowWithRole,
  mapMemberRow,
} from "@nextgen-cms/core/db/mappers/member";
import { authors, members, roles } from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

const memberSelectFields = {
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
};

function memberQuery() {
  return db
    .select(memberSelectFields)
    .from(members)
    .innerJoin(roles, eq(members.roleId, roles.id));
}

export type MemberWriteInput = {
  username: string;
  email?: string | null;
  passwordHash?: string | null;
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
  legacyAuthorId?: number | null;
};

export async function findMemberByEmail(email: string) {
  const rows = await memberQuery().where(eq(members.email, email)).limit(1);
  const row = rows[0];
  return row ? mapMemberRow(row as MemberRowWithRole) : null;
}

export async function findMemberByUsername(username: string) {
  const rows = await memberQuery()
    .where(eq(members.username, username))
    .limit(1);
  const row = rows[0];
  return row ? mapMemberRow(row as MemberRowWithRole) : null;
}

export async function findMemberById(id: number) {
  const rows = await memberQuery().where(eq(members.id, id)).limit(1);
  const row = rows[0];
  return row ? mapMemberRow(row as MemberRowWithRole) : null;
}

export async function findMemberBySlug(slug: string) {
  const rows = await memberQuery().where(eq(members.slug, slug)).limit(1);
  const row = rows[0];
  return row ? mapMemberRow(row as MemberRowWithRole) : null;
}

export async function findMemberAuthByUsername(username: string) {
  const rows = await db
    .select({
      id: members.id,
      username: members.username,
      email: members.email,
      passwordHash: members.passwordHash,
      isActive: members.isActive,
    })
    .from(members)
    .where(eq(members.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function findMembersForArticleAttribution(
  memberId: number,
  permissions: Permission[],
) {
  if (permissions.includes("content.edit_all")) {
    const rows = await memberQuery()
      .where(eq(members.isActive, true))
      .orderBy(members.name);
    return rows.map((row) => mapMemberRow(row as MemberRowWithRole));
  }

  const row = await findMemberById(memberId);
  return row ? [row] : [];
}

export async function listMembersAdmin() {
  const rows = await memberQuery().orderBy(members.name);
  return rows.map((row) => mapMemberRow(row as MemberRowWithRole));
}

export async function memberSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(members.slug, slug), ne(members.id, excludeId))
      : eq(members.slug, slug);
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertMember(
  input: MemberWriteInput,
  timestamps: { createdAt: string; updatedAt: string },
) {
  const result = await db
    .insert(members)
    .values({
      username: input.username,
      email: input.email ?? null,
      passwordHash: input.passwordHash ?? null,
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
      legacyAuthorId: input.legacyAuthorId ?? null,
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    })
    .returning({ id: members.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert member");
  return id;
}

export async function updateMember(id: number, input: MemberWriteInput) {
  await db
    .update(members)
    .set({
      username: input.username,
      email: input.email ?? null,
      passwordHash: input.passwordHash ?? null,
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
      legacyAuthorId: input.legacyAuthorId ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));
}

export async function setMemberPassword(id: number, passwordHash: string) {
  await db
    .update(members)
    .set({
      passwordHash,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));
}

export async function updateMemberEmail(id: number, email: string) {
  await db
    .update(members)
    .set({
      email,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));
}

export async function updateMemberUsername(id: number, username: string) {
  await db
    .update(members)
    .set({
      username,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));
}

export type MemberPersonalInput = {
  name: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
};

type MemberAuthorProfileRow = {
  slug: string;
  name: string;
  displayRole: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  socialTwitter: string | null;
  socialTelegram: string | null;
  socialInstagram: string | null;
};

function authorProfileFromMember(row: MemberAuthorProfileRow) {
  return {
    slug: row.slug,
    name: row.name,
    role: row.displayRole,
    bio: row.bio,
    avatarSrc: row.avatarSrc,
    avatarAlt: row.avatarAlt,
    socialTwitter: row.socialTwitter,
    socialTelegram: row.socialTelegram,
    socialInstagram: row.socialInstagram,
  };
}

export async function ensureMemberAuthorProfile(
  memberId: number,
): Promise<number> {
  const rows = await db
    .select({
      slug: members.slug,
      name: members.name,
      displayRole: members.displayRole,
      bio: members.bio,
      avatarSrc: members.avatarSrc,
      avatarAlt: members.avatarAlt,
      socialTwitter: members.socialTwitter,
      socialTelegram: members.socialTelegram,
      socialInstagram: members.socialInstagram,
      legacyAuthorId: members.legacyAuthorId,
    })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  const row = rows[0];
  if (!row) throw new Error("عضو یافت نشد.");

  const profile = authorProfileFromMember(row);

  if (row.legacyAuthorId != null) {
    await db
      .update(authors)
      .set(profile)
      .where(eq(authors.id, row.legacyAuthorId));
    return row.legacyAuthorId;
  }

  const result = await db
    .insert(authors)
    .values(profile)
    .returning({ id: authors.id });

  const authorId = result[0]?.id;
  if (!authorId) throw new Error("Failed to insert author");

  await db
    .update(members)
    .set({
      legacyAuthorId: authorId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, memberId));

  return authorId;
}

export async function ensureMemberAuthorProfiles(
  memberIds: number[],
): Promise<number[]> {
  const authorIds: number[] = [];
  for (const memberId of memberIds) {
    authorIds.push(await ensureMemberAuthorProfile(memberId));
  }
  return authorIds;
}

export async function updateMemberPersonal(
  id: number,
  input: MemberPersonalInput,
) {
  await db
    .update(members)
    .set({
      name: input.name,
      bio: input.bio,
      avatarSrc: input.avatarSrc,
      avatarAlt: input.avatarAlt,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(members.id, id));

  await ensureMemberAuthorProfile(id);
}

export async function memberEmailExists(email: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(members.email, email), ne(members.id, excludeId))
      : eq(members.email, email);
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function memberUsernameExists(
  username: string,
  excludeId?: number,
) {
  const where =
    excludeId != null
      ? and(eq(members.username, username), ne(members.id, excludeId))
      : eq(members.username, username);
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .where(where)
    .limit(1);
  return rows.length > 0;
}
