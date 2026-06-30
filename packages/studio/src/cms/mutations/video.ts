"use server";

import { invalidateVideos } from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  findVideoById,
  insertVideo,
  updateVideo,
  type VideoWriteInput,
} from "@nextgen-cms/core/db/repositories/videos-admin";
import { promoteVideoThumbnailSrc } from "@nextgen-cms/core/media/promote-video-thumbnail";
import { parseJalaliInput } from "@nextgen-cms/core/platform/datetime";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  validateImageMeta,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type VideoFormData = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
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

function parseFormData(data: VideoFormData): VideoWriteInput {
  let publishedAt = data.publishedAt.trim();
  try {
    publishedAt = parseJalaliInput(publishedAt);
  } catch {
    // keep ISO
  }

  return {
    slug: data.slug.trim(),
    title: data.title.trim(),
    description: data.description.trim(),
    duration: data.duration.trim(),
    thumbnailSrc: data.thumbnailSrc.trim(),
    thumbnailAlt: data.thumbnailAlt.trim(),
    publishedAt,
  };
}

async function validate(input: VideoWriteInput, excludeId?: number) {
  const titleError = validateRequired(input.title, "عنوان");
  if (titleError) return titleError;
  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;
  const uniqueError = await assertUniqueSlug("video", input.slug, excludeId);
  if (uniqueError) return uniqueError;
  const thumbError = validateImageMeta(
    input.thumbnailSrc,
    input.thumbnailAlt,
    "تصویر بندانگشتی",
  );
  if (thumbError) return thumbError;
  const dateError = validateRequired(input.publishedAt, "تاریخ انتشار");
  if (dateError) return dateError;
  return undefined;
}

async function resolveVideoThumbnailSrc(
  videoId: number,
  thumbnailSrc: string,
): Promise<string> {
  if (!thumbnailSrc.trim()) return thumbnailSrc;
  return promoteVideoThumbnailSrc(videoId, thumbnailSrc);
}

export async function createVideo(
  data: VideoFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.video.create",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = parseFormData(data);
  const error = await validate(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertVideo(input, access(session.memberId));
    const thumbnailSrc = await resolveVideoThumbnailSrc(id, input.thumbnailSrc);
    if (thumbnailSrc !== input.thumbnailSrc) {
      await updateVideo(
        id,
        { ...input, thumbnailSrc },
        access(session.memberId),
      );
    }
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveVideo(
  id: number,
  data: VideoFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };

  const input = parseFormData(data);
  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    const thumbnailSrc = await resolveVideoThumbnailSrc(id, input.thumbnailSrc);
    await updateVideo(
      id,
      { ...input, thumbnailSrc },
      access(session.memberId),
    );
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createVideoAndRedirect(data: VideoFormData) {
  const result = await createVideo(data);
  if (!result.ok) return result;
  redirect(`/admin/videos/${result.id}/edit`);
}
