import type { Permission } from "@nextgen-cms/contract/permissions";
import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { PERMISSION_DENIED } from "@nextgen-cms/core/db/access/permission-messages";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { forbidden } from "next/navigation";

export async function requirePermission(
  permission: Permission,
): Promise<MemberSession> {
  const session = await requireMember();
  if (!session.permissions.includes(permission)) {
    forbidden();
  }
  return session;
}

export async function requirePermissionMutation(
  permission: Permission,
): Promise<MemberSession | MutationResult> {
  const session = await requireMember();
  if (!session.permissions.includes(permission)) {
    return permissionDeniedResult();
  }
  return session;
}

export function sessionHasPermission(
  session: MemberSession,
  permission: Permission,
): boolean {
  return session.permissions.includes(permission);
}

export function assertSessionPermission(
  session: MemberSession,
  permission: Permission,
): Response | null {
  if (!sessionHasPermission(session, permission)) {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}

export function assertSessionPermissionJson(
  session: MemberSession,
  permission: Permission,
): Response | null {
  if (!sessionHasPermission(session, permission)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export { PERMISSION_DENIED };
