"use server";

import {
  invalidateContentGroup,
  invalidateContentGroups,
} from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  type ContentGroupWriteInput,
  contentGroupNumberExistsAdmin,
  findContentGroupById,
  insertContentGroup,
  updateContentGroup,
} from "@nextgen-cms/core/db/repositories/content-groups-admin";
import { contentGroupPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import { parseJalaliInput } from "@nextgen-cms/core/platform/datetime";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import {
  validateImageMeta,
  validateRequired,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type ContentGroupFormData = {
  number: number;
  season: string;
  year: number;
  label: string;
  coverSrc: string;
  coverAlt: string;
  pdfSrc: string;
  publishedAt: string;
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
    number: data.number,
    season: data.season.trim(),
    year: data.year,
    label: data.label.trim(),
    coverSrc: data.coverSrc.trim(),
    coverAlt: data.coverAlt.trim(),
    pdfSrc: data.pdfSrc.trim() || null,
    publishedAt,
  };
}

async function validate(input: ContentGroupWriteInput, excludeId?: number) {
  if (!input.number || input.number < 1) {
    return "شماره گروه محتوا نامعتبر است.";
  }
  const labelError = validateRequired(input.label, "برچسب");
  if (labelError) return labelError;
  const coverError = validateImageMeta(input.coverSrc, input.coverAlt, "جلد");
  if (coverError) return coverError;
  if (input.pdfSrc && !input.pdfSrc.toLowerCase().endsWith(".pdf")) {
    return "فایل PDF نامعتبر است.";
  }
  const exists = await contentGroupNumberExistsAdmin(input.number, excludeId);
  if (exists) return "این شماره قبلاً استفاده شده است.";
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
): Promise<string | null> {
  if (!pdfSrc?.trim()) return null;
  return promoteMediaToFolder(pdfSrc, contentGroupPath(contentGroupId));
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
  const error = await validate(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertContentGroup(input, access(session.memberId));
    const coverSrc = await resolveContentGroupCoverSrc(id, input.coverSrc);
    const pdfSrc = await resolveContentGroupPdfSrc(id, input.pdfSrc);
    if (coverSrc !== input.coverSrc || pdfSrc !== input.pdfSrc) {
      await updateContentGroup(
        id,
        { ...input, coverSrc, pdfSrc },
        access(session.memberId),
      );
    }
    invalidateContentGroups();
    invalidateContentGroup(input.number);
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
  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    const coverSrc = await resolveContentGroupCoverSrc(id, input.coverSrc);
    const pdfSrc = await resolveContentGroupPdfSrc(id, input.pdfSrc);
    await updateContentGroup(
      id,
      { ...input, coverSrc, pdfSrc },
      access(session.memberId),
    );
    invalidateContentGroups();
    invalidateContentGroup(input.number);
    if (existing.number !== input.number) {
      invalidateContentGroup(existing.number);
    }
    return { ok: true, id };
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
