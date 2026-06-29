import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type {
  MediaAsset,
  MediaUploadContext,
} from "@nextgen-cms/contract/types/media";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { findArticleIdsByCreator } from "@nextgen-cms/core/db/repositories/articles";
import {
  listFolderPaths,
  listMediaAssets,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  contentGroupPath,
  contentPath,
  writerDraftPath,
} from "@nextgen-cms/core/media/path-policy";
import { hasPermission } from "@nextgen-cms/studio/admin/article-access";
import {
  assertMediaFolderAccess,
  canReadFolder,
  canWriteFolder,
  getDefaultMediaFolder,
  getVirtualRootFolders,
  hasFullMediaAccess,
} from "@nextgen-cms/studio/admin/media-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";

export type ListMediaOptions = {
  folder?: string;
  contentId?: number;
  contentGroupId?: number;
};

export type MediaBrowseContext = {
  defaultFolder: string;
  canUpload: boolean;
  canDeleteAll: boolean;
  ownedContentIds: number[];
};

async function loadOwnedContentIds(session: MemberSession): Promise<number[]> {
  if (hasFullMediaAccess(session)) return [];
  return findArticleIdsByCreator(session.memberId);
}

export async function getMediaBrowseContext(
  session: MemberSession,
): Promise<MediaBrowseContext> {
  const ownedContentIds = await loadOwnedContentIds(session);
  return {
    defaultFolder: getDefaultMediaFolder(session),
    canUpload: hasPermission(session, "media.upload"),
    canDeleteAll: hasPermission(session, "media.delete_all"),
    ownedContentIds,
  };
}

export async function listMedia(
  options: ListMediaOptions = {},
): Promise<MediaAsset[]> {
  const session = await requireMember();
  const ownedContentIds = await loadOwnedContentIds(session);

  if (options.contentId != null) {
    const folder = contentPath(options.contentId);
    const access = assertMediaFolderAccess(session, folder, ownedContentIds);
    if (!access.ok) return [];
    return listMediaAssets({ contentId: options.contentId });
  }

  if (options.contentGroupId != null) {
    const folder = contentGroupPath(options.contentGroupId);
    const access = assertMediaFolderAccess(session, folder, ownedContentIds);
    if (!access.ok) return [];
    return listMediaAssets({ folderPath: folder });
  }

  const folderPath = options.folder
    ? normalizeFolderPath(options.folder)
    : getDefaultMediaFolder(session);

  const access = assertMediaFolderAccess(session, folderPath, ownedContentIds);
  if (!access.ok) return [];

  return listMediaAssets({ folderPath });
}

export async function getMediaByFolder(
  folderPath: string,
): Promise<MediaAsset[]> {
  return listMedia({ folder: folderPath });
}

export async function getMediaFolders(
  parentFolder?: string,
): Promise<string[]> {
  const session = await requireMember();
  const ownedContentIds = await loadOwnedContentIds(session);

  if (!parentFolder) {
    return getVirtualRootFolders(session, ownedContentIds);
  }

  const prefix = normalizeFolderPath(parentFolder).replace(/\/$/, "");
  const access = assertMediaFolderAccess(
    session,
    `${prefix}/`,
    ownedContentIds,
  );
  if (!access.ok) return [];

  const folders = await listFolderPaths(prefix);
  return folders.filter((folder) =>
    canReadFolder(session, folder, ownedContentIds),
  );
}

export async function listMediaForPicker(
  context: MediaUploadContext,
): Promise<MediaAsset[]> {
  const session = await requireMember();

  if (context.contentId != null) {
    return listMedia({ contentId: context.contentId });
  }

  if (context.contentGroupId != null) {
    return listMedia({ contentGroupId: context.contentGroupId });
  }

  const memberId = context.memberId ?? session.memberId;
  if (memberId !== session.memberId && !hasFullMediaAccess(session)) {
    return [];
  }

  return listMedia({ folder: writerDraftPath(memberId) });
}

export function canUploadToFolder(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
): boolean {
  return canWriteFolder(session, folder, ownedContentIds);
}
