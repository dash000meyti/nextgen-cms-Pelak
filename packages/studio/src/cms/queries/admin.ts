import { db } from "@nextgen-cms/core/db";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import { mapArticleRowToArticle } from "@nextgen-cms/core/db/mappers/article";
import {
  findArticleById,
  findArticlesForMember,
  resolveMemberIdsFromAuthorIds,
  resolveMemberNamesByAuthorIds,
} from "@nextgen-cms/core/db/repositories/articles";
import {
  findAllIssuesAdmin,
  findIssueById,
} from "@nextgen-cms/core/db/repositories/issues-admin";
import { findMembersForArticleAttribution } from "@nextgen-cms/core/db/repositories/members";
import {
  findAllMembersAdmin,
  findMemberForAdmin,
} from "@nextgen-cms/core/db/repositories/members-admin";
import { findAllRoles } from "@nextgen-cms/core/db/repositories/roles";
import {
  findAllTopicsAdmin,
  findTopicById,
} from "@nextgen-cms/core/db/repositories/topics-admin";
import {
  findAllVideosAdmin,
  findVideoById,
} from "@nextgen-cms/core/db/repositories/videos-admin";
import { issues, topics } from "@nextgen-cms/core/db/schema";
import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { canAccessMembersList } from "@nextgen-cms/studio/admin/member-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { asc } from "drizzle-orm";
import { forbidden } from "next/navigation";

function access(memberId: number) {
  return { memberId };
}

async function withMemberAccess<T>(
  fn: (memberId: number) => Promise<T>,
): Promise<T> {
  const session = await requireMember();
  try {
    return await fn(session.memberId);
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      forbidden();
    }
    throw error;
  }
}

export async function getArticleForAdmin(id: number) {
  return withMemberAccess(async (memberId) => {
    const row = await findArticleById(id, access(memberId));
    if (!row) return undefined;
    const authorIds = row.authors
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((link) => link.author.id);
    const memberIds = await resolveMemberIdsFromAuthorIds(authorIds);
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      excerpt: row.excerpt,
      status: row.status,
      publishedAt: row.publishedAt,
      readingMinutes: row.readingMinutes,
      heroSrc: row.heroSrc,
      heroAlt: row.heroAlt,
      heroCaption: row.heroCaption,
      heroCredit: row.heroCredit,
      issueNumber: row.issueNumber,
      isFeatured: row.isFeatured,
      isEditorsPick: row.isEditorsPick,
      body: row.body,
      relatedSlugs: row.relatedSlugs,
      memberIds,
      topicIds: row.topics.map((topic) => topic.id),
      createdByMemberId: row.createdByMemberId,
      article: mapArticleRowToArticle(row),
    };
  });
}

export async function listArticlesAdmin(status?: ArticleStatus | "all") {
  const session = await requireMember();
  try {
    const rows = await findArticlesForMember(
      session.memberId,
      session.permissions,
      { status: status && status !== "all" ? status : undefined },
    );

    const allAuthorIds = [
      ...new Set(
        rows.flatMap((row) => row.authors.map((link) => link.author.id)),
      ),
    ];
    const memberNames = await resolveMemberNamesByAuthorIds(allAuthorIds);

    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      status: row.status,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      authorNames: row.authors
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((link) => memberNames.get(link.author.id) ?? link.author.name)
        .join("، "),
    }));
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      forbidden();
    }
    throw error;
  }
}

export async function getMemberForAdmin(id: number) {
  return withMemberAccess(async (memberId) => {
    return findMemberForAdmin(id, access(memberId));
  });
}

export async function listMembersAdmin() {
  return withMemberAccess(async (memberId) => {
    return findAllMembersAdmin(access(memberId));
  });
}

export async function listSystemRoles() {
  const session = await requireMember();
  if (!canAccessMembersList(session)) {
    forbidden();
  }
  const roles = await findAllRoles();
  if (session.role.slug === "super_admin") {
    return roles;
  }
  return roles.filter((role) => role.slug === "writer");
}

export async function listRolesAdmin() {
  await requirePermission("settings.roles");
  return findAllRoles();
}

export async function listAllRolesForPicker() {
  const session = await requireMember();
  if (
    session.permissions.includes("settings.roles") ||
    session.permissions.includes("settings.members")
  ) {
    return findAllRoles();
  }
  if (canAccessMembersList(session)) {
    return findAllRoles();
  }
  forbidden();
}

/** @deprecated Use getMemberForAdmin */
export async function getAuthorForAdmin(id: number) {
  return getMemberForAdmin(id);
}

/** @deprecated Use listMembersAdmin */
export async function listAuthorsAdmin() {
  return listMembersAdmin();
}

export async function listTopicsAdmin() {
  return withMemberAccess(async (memberId) => {
    return findAllTopicsAdmin(access(memberId));
  });
}

export async function getTopicForAdmin(id: number) {
  return withMemberAccess(async (memberId) => {
    return findTopicById(id, access(memberId));
  });
}

export async function listIssuesAdmin() {
  return withMemberAccess(async (memberId) => {
    return findAllIssuesAdmin(access(memberId));
  });
}

export async function getIssueForAdmin(id: number) {
  return withMemberAccess(async (memberId) => {
    return findIssueById(id, access(memberId));
  });
}

export async function listVideosAdmin() {
  return withMemberAccess(async (memberId) => {
    return findAllVideosAdmin(access(memberId));
  });
}

export async function getVideoForAdmin(id: number) {
  return withMemberAccess(async (memberId) => {
    return findVideoById(id, access(memberId));
  });
}

export type PickerOption = {
  id: number;
  label: string;
  slug?: string;
  number?: number;
};

export async function findMembersForArticlePicker(): Promise<PickerOption[]> {
  const session = await requireMember();
  const rows = await findMembersForArticleAttribution(
    session.memberId,
    session.permissions,
  );
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    slug: row.slug,
  }));
}

/** @deprecated Use findMembersForArticlePicker */
export async function findAuthorsForPicker(): Promise<PickerOption[]> {
  return findMembersForArticlePicker();
}

export async function findTopicsForPicker(): Promise<PickerOption[]> {
  const session = await requireMember();
  const allowed =
    session.permissions.includes("settings.content") ||
    session.permissions.includes("content.create");
  if (!allowed) {
    await requirePermission("settings.content");
  }
  const rows = await db.select().from(topics).orderBy(asc(topics.name));
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
    slug: row.slug,
  }));
}

export async function findIssuesForPicker(): Promise<PickerOption[]> {
  const session = await requireMember();
  const allowed =
    session.permissions.includes("modules.issues.view") ||
    session.permissions.includes("content.create");
  if (!allowed) {
    await requirePermission("modules.issues.view");
  }
  const rows = await db.select().from(issues).orderBy(issues.number);
  return rows.map((row) => ({
    id: row.id,
    label: `شمارهٔ ${row.number.toLocaleString("fa-IR")} — ${row.label}`,
    number: row.number,
  }));
}
