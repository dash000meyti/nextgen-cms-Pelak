import type { Permission } from "@nextgen-cms/contract/permissions";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import { memberHasPermission } from "@nextgen-cms/core/db/repositories/permissions";

export async function memberCanDeleteArticle(
  memberId: number,
  article: { createdByMemberId: number | null },
): Promise<boolean> {
  return memberCanEditArticle(memberId, article);
}

export async function assertMemberCanDeleteArticle(
  memberId: number,
  article: { createdByMemberId: number | null },
): Promise<void> {
  const allowed = await memberCanDeleteArticle(memberId, article);
  if (!allowed) {
    throw new PermissionDeniedError();
  }
}

export async function memberCanEditArticle(
  memberId: number,
  article: { createdByMemberId: number | null },
): Promise<boolean> {
  if (await memberHasPermission(memberId, "content.edit_all")) return true;
  if (!(await memberHasPermission(memberId, "content.edit_own"))) return false;
  return article.createdByMemberId === memberId;
}

export async function assertMemberCanEditArticle(
  memberId: number,
  article: { createdByMemberId: number | null },
): Promise<void> {
  const allowed = await memberCanEditArticle(memberId, article);
  if (!allowed) {
    throw new PermissionDeniedError();
  }
}

export async function memberCanReadArticleAdmin(
  memberId: number,
  article: { createdByMemberId: number | null },
): Promise<boolean> {
  return memberCanEditArticle(memberId, article);
}

export async function memberHasAnyContentPermission(
  memberId: number,
): Promise<boolean> {
  const permissions: Permission[] = [
    "content.create",
    "content.edit_own",
    "content.edit_all",
    "content.publish",
  ];
  for (const permission of permissions) {
    if (await memberHasPermission(memberId, permission)) return true;
  }
  return false;
}

export async function assertMemberHasAnyContentPermission(
  memberId: number,
): Promise<void> {
  const allowed = await memberHasAnyContentPermission(memberId);
  if (!allowed) {
    throw new PermissionDeniedError();
  }
}

export async function memberHasEditAllArticles(
  memberId: number,
): Promise<boolean> {
  return memberHasPermission(memberId, "content.edit_all");
}

export async function assertMemberCanPublish(memberId: number): Promise<void> {
  await assertMemberPermission(memberId, "content.publish");
}
