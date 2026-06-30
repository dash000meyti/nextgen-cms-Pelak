import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type { MediaAsset } from "@nextgen-cms/contract/types/media";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import {
  contentPath,
  isContentGroupMediaPath,
  isVideoMediaPath,
  writerDraftPath,
} from "@nextgen-cms/core/media/path-policy";
import { hasPermission } from "@nextgen-cms/studio/admin/article-access";

export function hasFullMediaAccess(session: MemberSession): boolean {
  return hasPermission(session, "media.manage_all");
}

function canAccessContentGroupFolder(
  session: MemberSession,
  folder: string,
): boolean {
  if (!isContentGroupMediaPath(folder)) return false;
  return (
    hasPermission(session, "modules.contentGroup.create") ||
    hasPermission(session, "modules.contentGroup.edit")
  );
}

function canAccessVideoFolder(session: MemberSession, folder: string): boolean {
  if (!isVideoMediaPath(folder)) return false;
  return (
    hasPermission(session, "modules.video.create") ||
    hasPermission(session, "modules.video.edit")
  );
}

export function canReadFolder(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
): boolean {
  if (hasFullMediaAccess(session)) return true;

  const normalized = normalizeFolderPath(folder);
  const draftPath = writerDraftPath(session.memberId);
  if (normalized === draftPath || normalized.startsWith(draftPath)) {
    return true;
  }

  for (const contentId of ownedContentIds) {
    const ownedPath = contentPath(contentId);
    if (normalized === ownedPath || normalized.startsWith(ownedPath)) {
      return true;
    }
  }

  if (canAccessContentGroupFolder(session, normalized)) {
    return true;
  }

  if (canAccessVideoFolder(session, normalized)) {
    return true;
  }

  return false;
}

export function canWriteFolder(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
): boolean {
  if (!hasPermission(session, "media.upload")) return false;
  return canReadFolder(session, folder, ownedContentIds);
}

export function canDeleteAsset(
  session: MemberSession,
  asset: MediaAsset,
  ownedContentIds: number[],
): boolean {
  if (!canReadFolder(session, asset.folderPath, ownedContentIds)) return false;
  if (hasPermission(session, "media.delete_all")) return true;
  if (!hasPermission(session, "media.delete_own")) return false;
  return asset.uploadedByMemberId === session.memberId;
}

export function getDefaultMediaFolder(session: MemberSession): string {
  if (hasFullMediaAccess(session)) {
    return normalizeFolderPath("shared/site");
  }
  return writerDraftPath(session.memberId);
}

export function getVirtualRootFolders(
  session: MemberSession,
  ownedContentIds: number[],
): string[] {
  if (hasFullMediaAccess(session)) {
    return [
      normalizeFolderPath("shared"),
      normalizeFolderPath("content"),
      normalizeFolderPath("content-group"),
    ];
  }
  const roots = [
    writerDraftPath(session.memberId),
    ...ownedContentIds.map((id) => contentPath(id)),
  ];
  if (
    hasPermission(session, "modules.contentGroup.create") ||
    hasPermission(session, "modules.contentGroup.edit")
  ) {
    roots.push(normalizeFolderPath("content-group"));
  }
  if (
    hasPermission(session, "modules.video.create") ||
    hasPermission(session, "modules.video.edit")
  ) {
    roots.push(normalizeFolderPath("videos"));
  }
  return roots;
}

export type MediaFolderAccessMode = "read" | "write";

export function assertMediaFolderAccess(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
  mode: MediaFolderAccessMode = "read",
): { ok: true } | { ok: false; error: string } {
  const allowed =
    mode === "write"
      ? canWriteFolder(session, folder, ownedContentIds)
      : canReadFolder(session, folder, ownedContentIds);

  if (!allowed) {
    return { ok: false, error: PERMISSION_DENIED };
  }
  return { ok: true };
}
