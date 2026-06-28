import type { ArticleStatus } from "@nextgen-cms/contract/article-status";
import {
  isArchivedMediaPath,
  isDraftMediaPath,
  isSharedMediaPath,
  parseContentIdFromPath,
} from "@nextgen-cms/core/media/path-policy";

export type UploadServeDecision =
  | { access: "public" }
  | { access: "private" }
  | { access: "conditional"; contentId: number };

export function classifyUploadPath(relativePath: string): UploadServeDecision {
  if (isSharedMediaPath(relativePath)) {
    return { access: "public" };
  }
  if (isDraftMediaPath(relativePath)) {
    return { access: "private" };
  }
  if (isArchivedMediaPath(relativePath)) {
    return { access: "private" };
  }
  const contentId = parseContentIdFromPath(relativePath);
  if (contentId !== null) {
    return { access: "conditional", contentId };
  }
  return { access: "private" };
}

export function isContentMediaPublic(status: ArticleStatus | null): boolean {
  return status === "published";
}
