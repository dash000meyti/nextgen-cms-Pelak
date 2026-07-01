import type { ArticleStatus } from "@nextgen-cms/contract/article-status";
import {
  isContentGroupMediaPath,
  isMemberAvatarPath,
  isMemberDraftPath,
  isSiteMediaPath,
  isVideoMediaPath,
  parseContentIdFromPath,
} from "@nextgen-cms/core/media/path-policy";

export type UploadServeDecision =
  | { access: "public" }
  | { access: "private" }
  | { access: "conditional"; contentId: number };

export function classifyUploadPath(relativePath: string): UploadServeDecision {
  if (isMemberDraftPath(relativePath)) {
    return { access: "private" };
  }
  if (isSiteMediaPath(relativePath)) {
    return { access: "public" };
  }
  if (isMemberAvatarPath(relativePath)) {
    return { access: "public" };
  }
  if (isContentGroupMediaPath(relativePath)) {
    return { access: "public" };
  }
  if (isVideoMediaPath(relativePath)) {
    return { access: "public" };
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
