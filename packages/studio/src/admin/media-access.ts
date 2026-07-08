import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type { MediaAsset } from "@nextgen-cms/contract/types/media";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import {
  contentPath,
  isContentGroupMediaPath,
  isMemberDraftPath,
  isPlaylistMediaPath,
  isVideoMediaPath,
  memberAvatarPath,
  memberDraftPath,
  sitePath,
} from "@nextgen-cms/core/media/path-policy";
import { hasPermission } from "@nextgen-cms/studio/admin/article-access";

export function hasFullMediaAccess(session: MemberSession): boolean {
  return hasPermission(session, "media.manage_all");
}

function canAccessContentGroupModule(session: MemberSession): boolean {
  return (
    hasPermission(session, "modules.contentGroup.view") ||
    hasPermission(session, "modules.contentGroup.create") ||
    hasPermission(session, "modules.contentGroup.edit")
  );
}

function canAccessVideoModule(session: MemberSession): boolean {
  return (
    hasPermission(session, "modules.video.view") ||
    hasPermission(session, "modules.video.create") ||
    hasPermission(session, "modules.video.edit")
  );
}

function canAccessContentGroupFolder(
  session: MemberSession,
  folder: string,
): boolean {
  if (!isContentGroupMediaPath(folder)) return false;
  return canAccessContentGroupModule(session);
}

function canAccessVideoFolder(session: MemberSession, folder: string): boolean {
  if (!isVideoMediaPath(folder)) return false;
  return canAccessVideoModule(session);
}

function canAccessPlaylistFolder(
  session: MemberSession,
  folder: string,
): boolean {
  if (!isPlaylistMediaPath(folder)) return false;
  return canAccessVideoModule(session);
}

export function canBrowseMediaRoot(session: MemberSession): boolean {
  if (hasFullMediaAccess(session)) return true;
  if (hasPermission(session, "media.upload")) return true;
  if (hasPermission(session, "content.create")) return true;
  if (hasPermission(session, "content.edit_own")) return true;
  if (hasPermission(session, "content.edit_all")) return true;
  if (canAccessContentGroupModule(session)) return true;
  if (canAccessVideoModule(session)) return true;
  return false;
}

export function canReadFolder(
  session: MemberSession,
  folder: string,
  ownedContentIds: number[],
): boolean {
  if (!folder) return canBrowseMediaRoot(session);
  if (hasFullMediaAccess(session)) return true;

  const normalized = normalizeFolderPath(folder);
  const draftPath = memberDraftPath(session.memberId);
  if (normalized === draftPath || normalized.startsWith(draftPath)) {
    return true;
  }

  const site = sitePath();
  if (normalized === site || normalized.startsWith(site)) {
    return false;
  }

  if (normalized === normalizeFolderPath("members")) {
    return false;
  }

  if (isMemberDraftPath(normalized.replace(/\/$/, ""))) {
    return false;
  }

  if (normalized === normalizeFolderPath("content")) {
    return (
      hasPermission(session, "content.edit_all") || ownedContentIds.length > 0
    );
  }

  if (normalized === normalizeFolderPath("content-group")) {
    return canAccessContentGroupModule(session);
  }

  if (normalized === normalizeFolderPath("videos")) {
    return canAccessVideoModule(session);
  }

  if (normalized === normalizeFolderPath("playlists")) {
    return canAccessVideoModule(session);
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
  if (canAccessPlaylistFolder(session, normalized)) {
    return true;
  }

  const memberFolder = memberAvatarPath(session.memberId);
  if (normalized === memberFolder || normalized.startsWith(memberFolder)) {
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
    return sitePath();
  }
  return memberDraftPath(session.memberId);
}

export function getVirtualRootFolders(
  session: MemberSession,
  ownedContentIds: number[],
): string[] {
  if (hasFullMediaAccess(session)) {
    return [
      sitePath(),
      normalizeFolderPath("members"),
      normalizeFolderPath("content"),
      normalizeFolderPath("content-group"),
      normalizeFolderPath("videos"),
      normalizeFolderPath("playlists"),
    ];
  }
  const roots = [
    memberDraftPath(session.memberId),
    ...ownedContentIds.map((id) => contentPath(id)),
  ];
  if (canAccessContentGroupModule(session)) {
    roots.push(normalizeFolderPath("content-group"));
  }
  if (canAccessVideoModule(session)) {
    roots.push(normalizeFolderPath("videos"));
    roots.push(normalizeFolderPath("playlists"));
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
