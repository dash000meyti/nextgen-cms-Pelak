"use server";

import {
  invalidateContentGroup,
  invalidateContentGroups,
} from "@nextgen-cms/config/cache";
import type { ContentGroupStatus } from "@nextgen-cms/contract/content-group-status";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  type ContentGroupWriteInput,
  deleteContentGroup,
  findContentGroupById,
  insertContentGroup,
  setContentGroupArticleLinks,
  setContentGroupStatus,
  updateContentGroup,
} from "@nextgen-cms/core/db/repositories/content-groups-admin";
import { finalizeContentGroupPdf } from "@nextgen-cms/core/media/finalize-content-group-pdf";
import { contentGroupPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import { parseJalaliInput } from "@nextgen-cms/core/platform/datetime";
import {
  hasPermission,
  permissionDeniedResult,
} from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  normalizeSlugInput,
  validateImageMeta,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type ContentGroupFormData = {
  slug: string;
  title: string;
  status: ContentGroupStatus;
  publishedAt: string;
  coverSrc: string;
  coverAlt: string;
  pdfSrc: string;
  articleIds: number[];
};

function access(memberId: number) {
  return { memberId };
}

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  throw error;
}

function parseFormData(data: ContentGroupFormData): ContentGroupWriteInput {
  let publishedAt = data.publishedAt.trim();
  try {
    publishedAt = parseJalaliInput(publishedAt);
  } catch {
    // keep as-is if already ISO
  }

  return {
    slug: normalizeSlugInput(data.slug),
    title: data.title.trim(),
    status: data.status,
    coverSrc: data.coverSrc.trim(),
    coverAlt: data.coverAlt.trim(),
    pdfSrc: data.pdfSrc.trim() || null,
    publishedAt,
  };
}

function resolveContentGroupStatus(
  inputStatus: ContentGroupStatus,
  existingStatus: ContentGroupStatus | null,
  canPublish: boolean,
): ContentGroupStatus | MutationResult {
  if (canPublish) return inputStatus;
  if (!existingStatus) return "draft";
  if (inputStatus !== existingStatus && inputStatus !== "draft") {
    return permissionDeniedResult();
  }
  return existingStatus;
}

async function validate(
  input: ContentGroupWriteInput,
  excludeId?: number,
): Promise<string | undefined> {
  const titleError = validateRequired(input.title, "عنوان");
  if (titleError) return titleError;
  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;
  const uniqueError = await assertUniqueSlug(
    "contentGroup",
    input.slug,
    excludeId,
  );
  if (uniqueError) return uniqueError;
  const coverError = validateImageMeta(input.coverSrc, input.coverAlt, "جلد");
  if (coverError) return coverError;
  if (input.pdfSrc && !input.pdfSrc.toLowerCase().endsWith(".pdf")) {
    return "فایل PDF نامعتبر است.";
  }
  return undefined;
}

async function resolveContentGroupCoverSrc(
  contentGroupId: number,
  coverSrc: string,
): Promise<string> {
  if (!coverSrc.trim()) return coverSrc;
  return promoteMediaToFolder(coverSrc, contentGroupPath(contentGroupId));
}

async function resolveContentGroupPdfSrc(
  contentGroupId: number,
  pdfSrc: string | null | undefined,
  meta: { slug: string; title: string },
): Promise<string | null> {
  return finalizeContentGroupPdf({
    contentGroupId,
    pdfSrc,
    slug: meta.slug,
    title: meta.title,
  });
}

function invalidateAfterSave(
  slug: string,
  options?: { previousSlug?: string },
) {
  invalidateContentGroups();
  invalidateContentGroup(slug);
  if (options?.previousSlug && options.previousSlug !== slug) {
    invalidateContentGroup(options.previousSlug);
  }
}

export async function createContentGroup(
  data: ContentGroupFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.create",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = parseFormData(data);
  const canPublish = hasPermission(session, "modules.contentGroup.edit");
  const statusResult = resolveContentGroupStatus(
    input.status,
    null,
    canPublish,
  );
  if (typeof statusResult === "object" && "ok" in statusResult) {
    return statusResult;
  }
  input.status = statusResult;

  const error = await validate(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertContentGroup(input, access(session.memberId));
    const coverSrc = await resolveContentGroupCoverSrc(id, input.coverSrc);
    const pdfSrc = await resolveContentGroupPdfSrc(id, input.pdfSrc, {
      slug: input.slug,
      title: input.title,
    });
    if (coverSrc !== input.coverSrc || pdfSrc !== input.pdfSrc) {
      await updateContentGroup(
        id,
        { ...input, coverSrc, pdfSrc },
        access(session.memberId),
      );
    }
    await setContentGroupArticleLinks(id, data.articleIds);
    invalidateAfterSave(input.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveContentGroup(
  id: number,
  data: ContentGroupFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };

  const input = parseFormData(data);
  const statusResult = resolveContentGroupStatus(
    input.status,
    existing.status,
    true,
  );
  if (typeof statusResult === "object" && "ok" in statusResult) {
    return statusResult;
  }
  input.status = statusResult;

  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    const coverSrc = await resolveContentGroupCoverSrc(id, input.coverSrc);
    const pdfSrc = await resolveContentGroupPdfSrc(id, input.pdfSrc, {
      slug: input.slug,
      title: input.title,
    });
    await updateContentGroup(
      id,
      { ...input, coverSrc, pdfSrc },
      access(session.memberId),
    );
    await setContentGroupArticleLinks(id, data.articleIds);
    invalidateAfterSave(input.slug, { previousSlug: existing.slug });
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function publishContentGroup(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };

  try {
    await setContentGroupStatus(id, "published", access(session.memberId));
    invalidateAfterSave(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function unpublishContentGroup(
  id: number,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };

  try {
    await setContentGroupStatus(id, "draft", access(session.memberId));
    invalidateAfterSave(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function archiveContentGroup(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };
  if (existing.status === "archived") {
    return { ok: false, error: "این گروه محتوا قبلاً بایگانی شده است." };
  }

  try {
    await setContentGroupStatus(id, "archived", access(session.memberId));
    invalidateAfterSave(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function restoreContentGroupFromArchive(
  id: number,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };
  if (existing.status !== "archived") {
    return { ok: false, error: "این گروه محتوا در بایگانی نیست." };
  }

  try {
    await setContentGroupStatus(id, "draft", access(session.memberId));
    invalidateAfterSave(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function removeContentGroup(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.delete",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findContentGroupById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "گروه محتوا یافت نشد." };
  if (existing.status !== "archived") {
    return {
      ok: false,
      error: "فقط گروه محتوای بایگانی‌شده قابل حذف دائمی است.",
    };
  }

  try {
    const slug = existing.slug;
    await deleteContentGroup(id, access(session.memberId));
    invalidateAfterSave(slug);
    return { ok: true };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createContentGroupAndRedirect(
  data: ContentGroupFormData,
) {
  const result = await createContentGroup(data);
  if (!result.ok) return result;
  redirect(`/admin/content-group/${result.id}/edit`);
}

export async function archiveContentGroupAndRedirect(id: number) {
  const result = await archiveContentGroup(id);
  if (!result.ok) return result;
  redirect("/admin/content-group?status=archived");
}

export async function restoreContentGroupFromArchiveAndRedirect(id: number) {
  const result = await restoreContentGroupFromArchive(id);
  if (!result.ok) return result;
  redirect("/admin/content-group?status=draft");
}

export async function removeContentGroupAndRedirect(id: number) {
  const result = await removeContentGroup(id);
  if (!result.ok) return result;
  redirect("/admin/content-group?status=archived");
}
