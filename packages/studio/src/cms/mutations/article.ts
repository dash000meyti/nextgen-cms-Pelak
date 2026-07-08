"use server";

import {
  invalidateArticle,
  invalidateArticles,
  invalidateContentGroup,
  invalidateContentGroups,
} from "@nextgen-cms/config/cache";
import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  type ArticleWriteInput,
  archiveArticle as archiveArticleRepo,
  deleteArticle,
  findArticleById,
  findArticleContentGroupIds,
  insertArticle,
  resolveMemberIdsFromAuthorIds,
  restoreArticleFromArchive as restoreArticleFromArchiveRepo,
  updateArticle,
} from "@nextgen-cms/core/db/repositories/articles";
import { findContentGroupsByIds } from "@nextgen-cms/core/db/repositories/content-groups-admin";
import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { promoteArticleMedia } from "@nextgen-cms/core/media/promote-article-media";
import { purgeMediaForContent } from "@nextgen-cms/core/media/purge-folder";
import {
  canDeleteArticle,
  canEditArticle,
  canPublishContent,
  hasPermission,
  permissionDeniedResult,
  resolveArticleStatus,
} from "@nextgen-cms/studio/admin/article-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  normalizeSlugInput,
  parseArticleBlocks,
  validateArticleBlocks,
  validateImageMeta,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type ArticleFormData = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  status: ArticleStatus;
  publishedAt: string | null;
  readingMinutes: number;
  heroSrc: string;
  heroAlt: string;
  heroCaption: string;
  heroCredit: string;
  contentGroupIds: number[];
  isFeatured: boolean;
  isEditorsPick: boolean;
  body: ArticleBlock[];
  relatedSlugs: string[];
  memberIds: number[];
  topicIds: number[];
};

function access(memberId: number) {
  return { memberId };
}

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  throw error;
}

function parseFormData(data: ArticleFormData): ArticleWriteInput {
  return {
    slug: normalizeSlugInput(data.slug),
    title: data.title.trim(),
    subtitle: data.subtitle.trim(),
    excerpt: data.excerpt.trim(),
    status: data.status,
    publishedAt: data.publishedAt,
    readingMinutes: data.readingMinutes || 5,
    heroSrc: data.heroSrc.trim(),
    heroAlt: data.heroAlt.trim(),
    heroCaption: data.heroCaption.trim() || null,
    heroCredit: data.heroCredit.trim() || null,
    contentGroupIds: data.contentGroupIds,
    isFeatured: data.isFeatured,
    isEditorsPick: data.isEditorsPick,
    body: parseArticleBlocks(data.body),
    relatedSlugs: data.relatedSlugs.filter(Boolean),
    memberIds: data.memberIds,
    topicIds: data.topicIds,
  };
}

function normalizeMemberIds(
  memberIds: number[],
  session: Awaited<ReturnType<typeof requireMember>>,
): number[] {
  const ids = memberIds.length > 0 ? memberIds : [session.memberId];

  if (
    !hasPermission(session, "content.edit_all") &&
    (ids.length !== 1 || ids[0] !== session.memberId)
  ) {
    return [];
  }

  return ids;
}

async function validateArticleInput(
  input: ArticleWriteInput,
  excludeId?: number,
): Promise<string | undefined> {
  const titleError = validateRequired(input.title, "عنوان");
  if (titleError) return titleError;

  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;

  const uniqueError = await assertUniqueSlug("article", input.slug, excludeId);
  if (uniqueError) return uniqueError;

  const heroError = validateImageMeta(
    input.heroSrc,
    input.heroAlt,
    "تصویر شاخص",
  );
  if (heroError) return heroError;

  const bodyError = validateArticleBlocks(input.body);
  if (bodyError) return bodyError;

  if (input.memberIds.length === 0) return "حداقل یک عضو انتخاب کنید.";

  return undefined;
}

async function invalidateContentGroupsForArticle(
  current: number[],
  previous?: number[],
) {
  invalidateContentGroups();
  const allIds = [...new Set([...current, ...(previous ?? [])])];
  if (allIds.length === 0) return;
  const groups = await findContentGroupsByIds(allIds);
  for (const group of groups) {
    invalidateContentGroup(group.slug);
  }
}

async function invalidateAfterSave(
  slug: string,
  options?: {
    previousSlug?: string;
    contentGroupIds?: number[];
    previousContentGroupIds?: number[];
  },
) {
  invalidateArticles();
  invalidateArticle(slug);
  if (options?.previousSlug && options.previousSlug !== slug) {
    invalidateArticle(options.previousSlug);
  }
  await invalidateContentGroupsForArticle(
    options?.contentGroupIds ?? [],
    options?.previousContentGroupIds,
  );
}

async function existingContentGroupIds(articleId: number): Promise<number[]> {
  return findArticleContentGroupIds(articleId);
}

async function existingMemberIds(
  existing: NonNullable<Awaited<ReturnType<typeof findArticleById>>>,
): Promise<number[]> {
  const authorIds = existing.authors
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((link) => link.author.id);
  return resolveMemberIdsFromAuthorIds(authorIds);
}

export async function createArticle(
  data: ArticleFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("content.create");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = parseFormData(data);
  input.memberIds = normalizeMemberIds(input.memberIds, session);
  if (input.memberIds.length === 0) return permissionDeniedResult();

  const statusResult = resolveArticleStatus(
    input.status,
    null,
    canPublishContent(session),
  );
  if (typeof statusResult === "object" && "ok" in statusResult) {
    return statusResult;
  }
  input.status = statusResult;

  const error = await validateArticleInput(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertArticle(input, access(session.memberId), {
      createdByMemberId: session.memberId,
    });

    const promoted = await promoteArticleMedia(id, input.heroSrc, input.body);
    if (promoted.changed) {
      await updateArticle(
        id,
        { ...input, heroSrc: promoted.heroSrc, body: promoted.body },
        access(session.memberId),
      );
    }

    await invalidateAfterSave(input.slug, {
      contentGroupIds: input.contentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveArticle(
  id: number,
  data: ArticleFormData,
): Promise<MutationResult> {
  const session = await requireMember();
  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canEditArticle(session, existing)) return permissionDeniedResult();

  const input = parseFormData(data);
  input.memberIds = normalizeMemberIds(input.memberIds, session);
  if (input.memberIds.length === 0) return permissionDeniedResult();

  const statusResult = resolveArticleStatus(
    input.status,
    existing.status,
    canPublishContent(session),
  );
  if (typeof statusResult === "object" && "ok" in statusResult) {
    return statusResult;
  }
  input.status = statusResult;

  const error = await validateArticleInput(input, id);
  if (error) return { ok: false, error };

  try {
    const promoted = await promoteArticleMedia(id, input.heroSrc, input.body);
    await updateArticle(
      id,
      promoted.changed
        ? { ...input, heroSrc: promoted.heroSrc, body: promoted.body }
        : input,
      access(session.memberId),
    );
    const previousContentGroupIds = await existingContentGroupIds(id);
    await invalidateAfterSave(input.slug, {
      previousSlug: existing.slug,
      contentGroupIds: input.contentGroupIds,
      previousContentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function publishArticle(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("content.publish");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canEditArticle(session, existing)) return permissionDeniedResult();

  const publishedAt = existing.publishedAt ?? new Date().toISOString();

  try {
    const memberIds = await existingMemberIds(existing);
    const contentGroupIds = await existingContentGroupIds(id);
    const promoted = await promoteArticleMedia(
      id,
      existing.heroSrc,
      existing.body,
    );
    await updateArticle(
      id,
      {
        slug: existing.slug,
        title: existing.title,
        subtitle: existing.subtitle,
        excerpt: existing.excerpt,
        status: "published",
        publishedAt,
        readingMinutes: existing.readingMinutes,
        heroSrc: promoted.heroSrc,
        heroAlt: existing.heroAlt,
        heroCaption: existing.heroCaption,
        heroCredit: existing.heroCredit,
        contentGroupIds,
        isFeatured: existing.isFeatured,
        isEditorsPick: existing.isEditorsPick,
        body: promoted.body,
        relatedSlugs: existing.relatedSlugs,
        memberIds,
        topicIds: existing.topics.map((topic) => topic.id),
      },
      access(session.memberId),
    );

    await invalidateAfterSave(existing.slug, {
      contentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function unpublishArticle(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("content.publish");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canEditArticle(session, existing)) return permissionDeniedResult();

  try {
    const memberIds = await existingMemberIds(existing);
    const contentGroupIds = await existingContentGroupIds(id);
    await updateArticle(
      id,
      {
        slug: existing.slug,
        title: existing.title,
        subtitle: existing.subtitle,
        excerpt: existing.excerpt,
        status: "draft",
        publishedAt: existing.publishedAt,
        readingMinutes: existing.readingMinutes,
        heroSrc: existing.heroSrc,
        heroAlt: existing.heroAlt,
        heroCaption: existing.heroCaption,
        heroCredit: existing.heroCredit,
        contentGroupIds,
        isFeatured: existing.isFeatured,
        isEditorsPick: existing.isEditorsPick,
        body: existing.body,
        relatedSlugs: existing.relatedSlugs,
        memberIds,
        topicIds: existing.topics.map((topic) => topic.id),
      },
      access(session.memberId),
    );

    await invalidateAfterSave(existing.slug, {
      contentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function archiveArticle(id: number): Promise<MutationResult> {
  const session = await requireMember();

  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canEditArticle(session, existing)) return permissionDeniedResult();
  if (existing.status === "archived") {
    return { ok: false, error: "این محتوا قبلاً بایگانی شده است." };
  }

  try {
    await archiveArticleRepo(id, access(session.memberId), {
      heroSrc: existing.heroSrc,
      body: existing.body,
    });
    const contentGroupIds = await existingContentGroupIds(id);
    await invalidateAfterSave(existing.slug, {
      contentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function restoreArticleFromArchive(
  id: number,
): Promise<MutationResult> {
  const session = await requireMember();

  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canEditArticle(session, existing)) return permissionDeniedResult();
  if (existing.status !== "archived") {
    return { ok: false, error: "این محتوا در بایگانی نیست." };
  }

  try {
    await restoreArticleFromArchiveRepo(id, access(session.memberId), {
      heroSrc: existing.heroSrc,
      body: existing.body,
    });
    const contentGroupIds = await existingContentGroupIds(id);
    await invalidateAfterSave(existing.slug, {
      contentGroupIds,
    });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function removeArticle(id: number): Promise<MutationResult> {
  const session = await requireMember();

  const existing = await findArticleById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "محتوا یافت نشد." };
  if (!canDeleteArticle(session, existing)) return permissionDeniedResult();
  if (existing.status !== "archived") {
    return {
      ok: false,
      error: "فقط محتوای بایگانی‌شده قابل حذف دائمی است.",
    };
  }

  try {
    await purgeMediaForContent(id);
    const contentGroupIds = await existingContentGroupIds(id);
    await deleteArticle(id, access(session.memberId));
    await invalidateAfterSave(existing.slug, {
      contentGroupIds,
    });
    return { ok: true };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createArticleAndRedirect(data: ArticleFormData) {
  const result = await createArticle(data);
  if (!result.ok) return result;
  redirect(`/admin/content/${result.id}/edit`);
}

export async function saveArticleAndStay(
  id: number,
  data: ArticleFormData,
): Promise<MutationResult> {
  return saveArticle(id, data);
}

export async function archiveArticleAndRedirect(id: number) {
  const result = await archiveArticle(id);
  if (!result.ok) return result;
  redirect("/admin/content?status=archived");
}

export async function restoreArticleFromArchiveAndRedirect(id: number) {
  const result = await restoreArticleFromArchive(id);
  if (!result.ok) return result;
  redirect("/admin/content?status=draft");
}

export async function removeArticleAndRedirect(id: number) {
  const result = await removeArticle(id);
  if (!result.ok) return result;
  redirect("/admin/content?status=archived");
}
