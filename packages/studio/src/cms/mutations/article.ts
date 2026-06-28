"use server";

import {
  invalidateArticle,
  invalidateArticles,
} from "@nextgen-cms/config/cache";
import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  type ArticleWriteInput,
  deleteArticle,
  findArticleById,
  insertArticle,
  resolveMemberIdsFromAuthorIds,
  updateArticle,
} from "@nextgen-cms/core/db/repositories/articles";
import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { archiveMediaForContent } from "@nextgen-cms/core/media/archive";
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
  issueNumber: number | null;
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
    slug: data.slug.trim(),
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
    issueNumber: data.issueNumber,
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

async function invalidateAfterSave(slug: string, previousSlug?: string) {
  invalidateArticles();
  invalidateArticle(slug);
  if (previousSlug && previousSlug !== slug) {
    invalidateArticle(previousSlug);
  }
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
    await invalidateAfterSave(input.slug);
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
    await updateArticle(id, input, access(session.memberId));
    await invalidateAfterSave(input.slug, existing.slug);
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
        heroSrc: existing.heroSrc,
        heroAlt: existing.heroAlt,
        heroCaption: existing.heroCaption,
        heroCredit: existing.heroCredit,
        issueNumber: existing.issueNumber,
        isFeatured: existing.isFeatured,
        isEditorsPick: existing.isEditorsPick,
        body: existing.body,
        relatedSlugs: existing.relatedSlugs,
        memberIds,
        topicIds: existing.topics.map((topic) => topic.id),
      },
      access(session.memberId),
    );

    await invalidateAfterSave(existing.slug);
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
        issueNumber: existing.issueNumber,
        isFeatured: existing.isFeatured,
        isEditorsPick: existing.isEditorsPick,
        body: existing.body,
        relatedSlugs: existing.relatedSlugs,
        memberIds,
        topicIds: existing.topics.map((topic) => topic.id),
      },
      access(session.memberId),
    );

    await invalidateAfterSave(existing.slug);
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

  try {
    await archiveMediaForContent(id);
    await deleteArticle(id, access(session.memberId));
    await invalidateAfterSave(existing.slug);
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

export async function removeArticleAndRedirect(id: number) {
  const result = await removeArticle(id);
  if (!result.ok) return result;
  redirect("/admin/content");
}
