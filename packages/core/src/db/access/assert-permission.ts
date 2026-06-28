import type { Permission } from "@nextgen-cms/contract/permissions";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import { memberHasPermission } from "@nextgen-cms/core/db/repositories/permissions";

export async function assertMemberPermission(
  memberId: number,
  permission: Permission,
): Promise<void> {
  const allowed = await memberHasPermission(memberId, permission);
  if (!allowed) {
    throw new PermissionDeniedError();
  }
}
