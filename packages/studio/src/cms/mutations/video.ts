"use server";

import { invalidateVideos } from "@nextgen-cms/config/cache";
import type { VideoStatus } from "@nextgen-cms/contract/video-status";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  deleteVideo as deleteVideoRepo,
  findVideoById,
  insertVideo,
  setVideoStatus,
  updateVideo,
  type VideoWriteInput,
} from "@nextgen-cms/core/db/repositories/videos-admin";
import {
  buildAparatPageUrl,
  fetchAparatVideoMetadata,
  parseAparatHash,
} from "@nextgen-cms/core/integrations/aparat";
import { videoPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import { parseJalaliInput } from "@nextgen-cms/core/platform/datetime";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
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

export type VideoFormData = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  status: VideoStatus;
  linkSource: "thumbnail" | "aparat";
  externalLink: string;
  aparatUrl: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  publishedAt: string;
  playlistIds: number[];
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
    slug: normalizeSlugInput(data.slug),
    title: data.title.trim(),
    description: data.description.trim(),
    duration: data.duration.trim(),
    status: data.status,
    linkSource: data.linkSource,
    externalLink: data.externalLink.trim() || null,
    aparatUrl: data.aparatUrl.trim() || null,
    thumbnailSrc: data.thumbnailSrc.trim(),
    thumbnailAlt: data.thumbnailAlt.trim(),
    publishedAt,
    playlistIds: data.playlistIds,
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
  if (input.linkSource === "thumbnail") {
    const linkError = validateRequired(input.externalLink, "لینک ویدیو");
    if (linkError) return linkError;
  }
  if (input.linkSource === "aparat") {
    const aparatError = validateRequired(input.aparatUrl, "لینک آپارات");
    if (aparatError) return aparatError;
  }
  const dateError = validateRequired(input.publishedAt, "تاریخ انتشار");
  if (dateError) return dateError;
  return undefined;
}

async function resolveVideoThumbnailSrc(
  videoId: number,
  thumbnailSrc: string,
): Promise<string> {
  if (!thumbnailSrc.trim()) return thumbnailSrc;
  return promoteMediaToFolder(thumbnailSrc, videoPath(videoId));
}

async function enrichWithAparat(
  input: VideoWriteInput,
): Promise<VideoWriteInput> {
  if (input.linkSource !== "aparat" || !input.aparatUrl) return input;
  const metadata = await fetchAparatVideoMetadata(input.aparatUrl);
  if (!metadata) return input;
  return {
    ...input,
    title: input.title || metadata.title,
    duration: input.duration || metadata.duration,
    thumbnailSrc: input.thumbnailSrc || metadata.bigPoster,
    externalLink: input.externalLink || metadata.pageUrl,
  };
}

export async function createVideo(
  data: VideoFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.video.create",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = await enrichWithAparat(parseFormData(data));
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

  const input = await enrichWithAparat(parseFormData(data));
  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    const thumbnailSrc = await resolveVideoThumbnailSrc(id, input.thumbnailSrc);
    await updateVideo(id, { ...input, thumbnailSrc }, access(session.memberId));
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

export async function publishVideo(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };
  try {
    await setVideoStatus(id, "published", access(session.memberId));
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function unpublishVideo(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };
  try {
    await setVideoStatus(id, "draft", access(session.memberId));
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function archiveVideo(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };
  if (existing.status === "archived") {
    return { ok: false, error: "این ویدیو قبلاً بایگانی شده است." };
  }
  try {
    await setVideoStatus(id, "archived", access(session.memberId));
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function restoreVideoFromArchive(
  id: number,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };
  if (existing.status !== "archived") {
    return { ok: false, error: "این ویدیو در بایگانی نیست." };
  }
  try {
    await setVideoStatus(id, "draft", access(session.memberId));
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function removeVideo(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.video.delete",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findVideoById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "ویدیو یافت نشد." };
  if (existing.status !== "archived") {
    return { ok: false, error: "فقط ویدیوی بایگانی‌شده قابل حذف دائمی است." };
  }
  try {
    await deleteVideoRepo(id, access(session.memberId));
    invalidateVideos();
    return { ok: true };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function resolveAparatFromUrl(url: string): Promise<
  | {
      ok: true;
      data: {
        title: string;
        duration: string;
        thumbnailSrc: string;
        externalLink: string;
      };
    }
  | MutationResult
> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.view");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  try {
    const metadata = await fetchAparatVideoMetadata(url);
    if (!metadata) {
      const hash = parseAparatHash(url);
      if (!hash) {
        return { ok: false, error: "لینک آپارات معتبر نیست." };
      }
      return {
        ok: true,
        data: {
          title: "",
          duration: "",
          thumbnailSrc: "",
          externalLink: buildAparatPageUrl(hash),
        },
      };
    }
    return {
      ok: true,
      data: {
        title: metadata.title,
        duration: metadata.duration,
        thumbnailSrc: metadata.bigPoster,
        externalLink: metadata.pageUrl,
      },
    };
  } catch {
    return { ok: false, error: "خطا در دریافت اطلاعات آپارات." };
  }
}
