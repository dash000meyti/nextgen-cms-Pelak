import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";

export function isDraftMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return /^content\/draft\/\d+(\/|$)/.test(normalized);
}

export function isSharedMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return normalized.startsWith("shared/");
}

export function isArchivedMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  return normalized.startsWith("archived/");
}

export function isContentMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("content/draft/")) return false;
  return /^content\/\d+(\/|$)/.test(normalized);
}

export function parseContentIdFromPath(relativePath: string): number | null {
  const normalized = relativePath.replace(/\\/g, "/");
  if (normalized.startsWith("content/draft/")) return null;
  const match = normalized.match(/^content\/(\d+)\//);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isNaN(id) ? null : id;
}

export function archivedContentPath(contentId: number): string {
  return normalizeFolderPath(`archived/content/${contentId}`);
}

export function writerDraftPath(memberId: number): string {
  return normalizeFolderPath(`content/draft/${memberId}`);
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

export function memberAvatarPath(memberId: number): string {
  return normalizeFolderPath(`shared/members/${memberId}`);
}

export function isContentGroupMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return /^content-group\/\d+/.test(normalized);
}

export function isVideoMediaPath(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return /^videos\/\d+/.test(normalized);
}
