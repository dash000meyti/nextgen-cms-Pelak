import type { DefaultRoleSlug } from "@nextgen-cms/contract/roles";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { hasPermission, permissionDeniedResult } from "./article-access";

const ROLE_RANK: Record<DefaultRoleSlug, number> = {
  writer: 1,
  editor_in_chief: 2,
  super_admin: 3,
};

export function getRoleRank(slug: string): number {
  if (slug in ROLE_RANK) {
    return ROLE_RANK[slug as DefaultRoleSlug];
  }
  return 0;
}

export function canAccessMembersList(session: MemberSession): boolean {
  return (
    hasPermission(session, "members.create") ||
    hasPermission(session, "members.edit") ||
    hasPermission(session, "members.delete")
  );
}

export function canAssignRole(
  session: MemberSession,
  targetRoleSlug: string,
): boolean {
  if (session.role.slug === "super_admin") return true;
  if (session.role.slug === "editor_in_chief") {
    return targetRoleSlug === "writer";
  }
  return false;
}

export function assertCanAssignRole(
  session: MemberSession,
  targetRoleSlug: string,
): MutationResult | null {
  if (!canAssignRole(session, targetRoleSlug)) {
    return permissionDeniedResult();
  }
  return null;
}

export function assertCanChangeOwnRole(
  session: MemberSession,
  targetMemberId: number,
  newRoleSlug: string,
): MutationResult | null {
  if (targetMemberId !== session.memberId) return null;

  const newRank = getRoleRank(newRoleSlug);
  const editorRank = ROLE_RANK.editor_in_chief;
  if (newRank > editorRank) {
    return { ok: false, error: PERMISSION_DENIED };
  }
  return null;
}
