import type { Permission } from "@nextgen-cms/contract/permissions";
import { db } from "@nextgen-cms/core/db";
import { members, rolePermissions } from "@nextgen-cms/core/db/schema";
import { eq } from "drizzle-orm";

export async function getMemberPermissions(
  memberId: number,
): Promise<Permission[]> {
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(members)
    .innerJoin(rolePermissions, eq(members.roleId, rolePermissions.roleId))
    .where(eq(members.id, memberId));

  return rows.map((row) => row.permission);
}

export async function memberHasPermission(
  memberId: number,
  permission: Permission,
): Promise<boolean> {
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(members)
    .innerJoin(rolePermissions, eq(members.roleId, rolePermissions.roleId))
    .where(eq(members.id, memberId));

  return rows.some((row) => row.permission === permission);
}
