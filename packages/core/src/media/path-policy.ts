import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";

function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

export function sitePath(): string {
  return normalizeFolderPath("site");
}

export function memberAvatarPath(memberId: number): string {
  return normalizeFolderPath(`members/${memberId}`);
}

export function memberDraftPath(memberId: number): string {
  return normalizeFolderPath(`members/${memberId}/draft`);
}

/** @deprecated Use memberDraftPath — legacy content/draft during migration */
export function writerDraftPath(memberId: number): string {
  return memberDraftPath(memberId);
}

export function isMemberDraftPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  if (/^members\/\d+\/draft(\/|$)/.test(normalized)) return true;
  return /^content\/draft\/\d+(\/|$)/.test(normalized);
}

export function isSiteMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return normalized === "site" || normalized.startsWith("site/");
}

export function isMemberAvatarPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  if (isMemberDraftPath(normalized)) return false;
  return /^members\/\d+(\/|$)/.test(normalized);
}

/** @deprecated Legacy shared/ prefix — migration only */
export function isLegacySharedMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return normalized === "shared" || normalized.startsWith("shared/");
}

/** @deprecated Legacy archived/ prefix — migration only */
export function isLegacyArchivedMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return normalized.startsWith("archived/");
}

export function isDraftMediaPath(relativePath: string): boolean {
  return isMemberDraftPath(relativePath);
}

export function isContentMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  if (normalized.startsWith("content/draft/")) return false;
  return /^content\/\d+(\/|$)/.test(normalized);
}

export function parseContentIdFromPath(relativePath: string): number | null {
  const normalized = normalizeRelativePath(relativePath);
  if (normalized.startsWith("content/draft/")) return null;
  const match = normalized.match(/^content\/(\d+)\//);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isNaN(id) ? null : id;
}

export function contentPath(contentId: number): string {
  return normalizeFolderPath(`content/${contentId}`);
}

export function contentGroupPath(contentGroupId: number): string {
  return normalizeFolderPath(`content-group/${contentGroupId}`);
}

export function videoPath(videoId: number): string {
  return normalizeFolderPath(`videos/${videoId}`);
}

export function isContentGroupMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return /^content-group\/\d+/.test(normalized);
}

export function isVideoMediaPath(relativePath: string): boolean {
  const normalized = normalizeRelativePath(relativePath);
  return /^videos\/\d+/.test(normalized);
}

export function shouldSkipMediaPromote(relativePath: string): boolean {
  if (isMemberDraftPath(relativePath)) return false;
  if (isSiteMediaPath(relativePath)) return true;
  if (isMemberAvatarPath(relativePath)) return true;
  if (isLegacySharedMediaPath(relativePath)) {
    const normalized = normalizeRelativePath(relativePath);
    if (/^shared\/members\/\d+\/draft(\/|$)/.test(normalized)) return false;
    if (/^shared\/site(\/|$)/.test(normalized)) return true;
    if (/^shared\/members\/\d+(\/|$)/.test(normalized)) return true;
  }
  return false;
}
