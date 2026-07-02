import type { ArticleStatus } from "@nextgen-cms/contract/article-status";
import type { Permission } from "@nextgen-cms/contract/permissions";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";

export type PermissionBearer = Pick<MemberSession, "memberId" | "permissions">;

export function hasPermission(
  session: PermissionBearer,
  permission: Permission,
): boolean {
  return session.permissions.includes(permission);
}

export function canEditArticle(
  session: PermissionBearer,
  article: { createdByMemberId: number | null },
): boolean {
  if (hasPermission(session, "content.edit_all")) return true;
  if (!hasPermission(session, "content.edit_own")) return false;
  return article.createdByMemberId === session.memberId;
}

export function canDeleteArticle(
  session: PermissionBearer,
  article: { createdByMemberId: number | null },
): boolean {
  return canEditArticle(session, article);
}

export function canPublishContent(session: PermissionBearer): boolean {
  return hasPermission(session, "content.publish");
}

export function resolveArticleStatus(
  inputStatus: ArticleStatus,
  existingStatus: ArticleStatus | null,
  canPublish: boolean,
): ArticleStatus | MutationResult {
  if (canPublish) return inputStatus;

  if (!existingStatus) return "draft";

  if (inputStatus !== existingStatus && inputStatus !== "draft") {
    return { ok: false, error: PERMISSION_DENIED };
  }

  return existingStatus;
}

export function permissionDeniedResult(): MutationResult {
  return { ok: false, error: PERMISSION_DENIED };
}
