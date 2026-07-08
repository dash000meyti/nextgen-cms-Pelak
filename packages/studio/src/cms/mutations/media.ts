"use server";

import { randomUUID } from "node:crypto";
import type {
  MediaAsset,
  MediaUploadContext,
} from "@nextgen-cms/contract/types/media";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import {
  findArticleById,
  findArticleIdsByCreator,
} from "@nextgen-cms/core/db/repositories/articles";
import {
  getMediaAssetById,
  hardDeleteMediaAsset,
  insertMediaAsset,
  softDeleteMediaAsset,
} from "@nextgen-cms/core/db/repositories/media-assets";
import { getExtensionForMimeType } from "@nextgen-cms/core/media/constants";
import { resolveUploadFolder } from "@nextgen-cms/core/media/folders";
import {
  contentGroupPath,
  videoPath,
} from "@nextgen-cms/core/media/path-policy";
import { getMediaProcessor } from "@nextgen-cms/core/media/processor";
import {
  countMediaReferences,
  mediaReferenceSummary,
} from "@nextgen-cms/core/media/references";
import {
  isMimeAllowed,
  resolveMaxBytesForMime,
} from "@nextgen-cms/core/media/settings";
import {
  removeMediaFile,
  saveMediaFile,
} from "@nextgen-cms/core/media/storage";
import {
  canEditArticle,
  hasPermission,
} from "@nextgen-cms/studio/admin/article-access";
import {
  assertMediaFolderAccess,
  canDeleteAsset,
  hasFullMediaAccess,
} from "@nextgen-cms/studio/admin/media-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { listMediaForPicker } from "@nextgen-cms/studio/cms/queries/media";

function parseUploadContext(
  formData: FormData,
  context?: MediaUploadContext,
): MediaUploadContext {
  const contentIdRaw = formData.get("contentId");
  const contentGroupIdRaw = formData.get("contentGroupId");
  const videoIdRaw = formData.get("videoId");
  const folderRaw = formData.get("folder");
  const memberIdRaw = formData.get("memberId");

  return {
    contentId:
      context?.contentId ??
      (typeof contentIdRaw === "string" && contentIdRaw
        ? Number.parseInt(contentIdRaw, 10)
        : undefined),
    contentGroupId:
      context?.contentGroupId ??
      (typeof contentGroupIdRaw === "string" && contentGroupIdRaw
        ? Number.parseInt(contentGroupIdRaw, 10)
        : undefined),
    videoId:
      context?.videoId ??
      (typeof videoIdRaw === "string" && videoIdRaw
        ? Number.parseInt(videoIdRaw, 10)
        : undefined),
    memberId:
      context?.memberId ??
      (typeof memberIdRaw === "string" && memberIdRaw
        ? Number.parseInt(memberIdRaw, 10)
        : undefined),
    folder:
      context?.folder ??
      (typeof folderRaw === "string" && folderRaw ? folderRaw : undefined),
  };
}

async function loadOwnedContentIds(session: MemberSession): Promise<number[]> {
  if (hasFullMediaAccess(session)) return [];
  return findArticleIdsByCreator(session.memberId);
}

async function validateUploadAccess(
  session: MemberSession,
  uploadContext: MediaUploadContext,
  folderPath: string,
): Promise<MutationResult | null> {
  const ownedContentIds = await loadOwnedContentIds(session);

  const folderAccess = assertMediaFolderAccess(
    session,
    folderPath,
    ownedContentIds,
    "write",
  );
  if (!folderAccess.ok) {
    return { ok: false, error: folderAccess.error };
  }

  if (uploadContext.contentId != null) {
    const article = await findArticleById(uploadContext.contentId);
    if (!article) {
      return { ok: false, error: "محتوا یافت نشد." };
    }
    if (!canEditArticle(session, article)) {
      return { ok: false, error: PERMISSION_DENIED };
    }
  }

  if (uploadContext.contentGroupId != null) {
    const expectedFolder = contentGroupPath(uploadContext.contentGroupId);
    if (folderPath !== expectedFolder) {
      return { ok: false, error: PERMISSION_DENIED };
    }
    if (
      !hasPermission(session, "modules.contentGroup.create") &&
      !hasPermission(session, "modules.contentGroup.edit")
    ) {
      return { ok: false, error: PERMISSION_DENIED };
    }
  }

  if (uploadContext.videoId != null) {
    const expectedFolder = videoPath(uploadContext.videoId);
    if (folderPath !== expectedFolder) {
      return { ok: false, error: PERMISSION_DENIED };
    }
    if (
      !hasPermission(session, "modules.video.create") &&
      !hasPermission(session, "modules.video.edit")
    ) {
      return { ok: false, error: PERMISSION_DENIED };
    }
  }

  if (
    uploadContext.memberId != null &&
    uploadContext.memberId !== session.memberId &&
    !hasFullMediaAccess(session)
  ) {
    return { ok: false, error: PERMISSION_DENIED };
  }

  return null;
}

async function resolveMaxUploadBytes(mimeType: string): Promise<number> {
  return resolveMaxBytesForMime(mimeType);
}

export async function uploadMedia(
  formData: FormData,
  context?: MediaUploadContext,
): Promise<MutationResult & { url?: string; asset?: MediaAsset }> {
  const sessionOrDenied = await requirePermissionMutation("media.upload");
  if (!("memberId" in sessionOrDenied)) return sessionOrDenied;
  const session = sessionOrDenied;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "فایلی انتخاب نشده است." };
  }

  const allowed = await isMimeAllowed(file.type);
  if (!allowed) {
    return { ok: false, error: "فرمت فایل مجاز نیست." };
  }

  const ext = getExtensionForMimeType(file.type);
  if (!ext) {
    return { ok: false, error: "فرمت فایل مجاز نیست." };
  }

  const hasExplicitFolder = context?.folder != null && context.folder !== "";
  const uploadContext = parseUploadContext(formData, {
    ...context,
    memberId: hasExplicitFolder
      ? context?.memberId
      : context?.contentGroupId != null ||
          context?.contentId != null ||
          context?.videoId != null
        ? context?.memberId
        : (context?.memberId ?? session.memberId),
  });

  const maxBytes = await resolveMaxUploadBytes(file.type);
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `حداکثر حجم فایل ${Math.round(maxBytes / (1024 * 1024))} مگابایت است.`,
    };
  }

  const folderPath = resolveUploadFolder(uploadContext);

  const accessError = await validateUploadAccess(
    session,
    uploadContext,
    folderPath,
  );
  if (accessError) return accessError;

  const uuid = randomUUID();
  const filename = `${uuid}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const processed = await getMediaProcessor().process(buffer, file.type, {});

  await saveMediaFile(folderPath, filename, processed.buffer);

  const asset = await insertMediaAsset({
    uuid,
    filename,
    originalName: file.name,
    mimeType: processed.mimeType,
    sizeBytes: processed.buffer.length,
    folderPath,
    uploadedByMemberId: session.memberId,
    contentId: uploadContext.contentId ?? null,
    createdAt: new Date().toISOString(),
    metadata: processed.metadata,
  });

  return { ok: true, url: asset.publicUrl, asset };
}

export async function deleteMedia(
  id: number,
  options?: { soft?: boolean },
): Promise<MutationResult> {
  const session = await requireMember();
  const ownedContentIds = await loadOwnedContentIds(session);

  const asset = await getMediaAssetById(id);
  if (!asset) {
    return { ok: false, error: "فایل یافت نشد." };
  }

  if (!canDeleteAsset(session, asset, ownedContentIds)) {
    return { ok: false, error: "اجازهٔ حذف این فایل را ندارید." };
  }

  if (options?.soft) {
    await softDeleteMediaAsset(id);
    return { ok: true };
  }

  const refCount = await countMediaReferences(asset.publicUrl);
  if (refCount > 0) {
    const summary = await mediaReferenceSummary(asset.publicUrl);
    const places = summary.length > 0 ? summary.join("، ") : "محتوا";
    return {
      ok: false,
      error: `فایل در ${places} استفاده شده و قابل حذف نیست.`,
    };
  }

  await removeMediaFile(asset.folderPath, asset.filename);
  await hardDeleteMediaAsset(id);
  return { ok: true };
}

export async function listMediaForPickerAction(
  context: MediaUploadContext,
): Promise<MediaAsset[]> {
  return listMediaForPicker(context);
}
