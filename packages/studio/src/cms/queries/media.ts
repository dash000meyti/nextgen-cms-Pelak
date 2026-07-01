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
import { mergeChildFolders } from "@nextgen-cms/core/media/folder-browse";
import {
  findAllArticleIds,
  findAllContentGroupIds,
  findAllMemberIds,
  findAllVideoIds,
  findArticleIdsByIds,
} from "@nextgen-cms/core/media/media-folder-entities";
import {
  contentGroupPath,
  contentPath,
  memberAvatarPath,
  memberDraftPath,
  videoPath,
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
  videoId?: number;
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

  if (options.videoId != null) {
    const folder = videoPath(options.videoId);
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

async function resolveEntityChildFolders(
  parentPrefix: string,
  session: MemberSession,
  ownedContentIds: number[],
): Promise<string[]> {
  const parent = parentPrefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  if (parent === "members") {
    const memberIds = await findAllMemberIds();
    return memberIds.map((id) => memberAvatarPath(id));
  }

  const memberMatch = parent.match(/^members\/(\d+)$/);
  if (memberMatch) {
    const memberId = Number.parseInt(memberMatch[1], 10);
    if (!Number.isNaN(memberId)) {
      return [memberDraftPath(memberId)];
    }
  }

  if (parent === "content") {
    const articleIds = hasFullMediaAccess(session)
      ? await findAllArticleIds()
      : await findArticleIdsByIds(ownedContentIds);
    return articleIds.map((id) => contentPath(id));
  }

  if (parent === "content-group") {
    const groupIds = await findAllContentGroupIds();
    return groupIds.map((id) => contentGroupPath(id));
  }

  if (parent === "videos") {
    const videoIds = await findAllVideoIds();
    return videoIds.map((id) => videoPath(id));
  }

  if (parent.startsWith("members/") && parent.endsWith("/draft")) {
    return [];
  }

  return [];
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

  const [dbFolders, entityFolders] = await Promise.all([
    listFolderPaths(prefix),
    resolveEntityChildFolders(prefix, session, ownedContentIds),
  ]);

  return mergeChildFolders(dbFolders, entityFolders).filter((folder) =>
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

  if (context.videoId != null) {
    return listMedia({ videoId: context.videoId });
  }

  const memberId = context.memberId ?? session.memberId;
  if (memberId !== session.memberId && !hasFullMediaAccess(session)) {
    return [];
  }

  return listMedia({ folder: memberDraftPath(memberId) });
}

export function canUploadToFolder(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
): boolean {
  return canWriteFolder(session, folder, ownedContentIds);
}
