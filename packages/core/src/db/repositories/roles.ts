import type { Permission } from "@nextgen-cms/contract/permissions";
import { db } from "@nextgen-cms/core/db";
import { members, rolePermissions, roles } from "@nextgen-cms/core/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";

export async function findAllRoles() {
  return db.select().from(roles).orderBy(roles.name);
}

export async function findRoleBySlug(slug: string) {
  const rows = await db
    .select()
    .from(roles)
    .where(eq(roles.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function findRoleById(id: number) {
  const rows = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPermissionsForRole(
  roleId: number,
): Promise<Permission[]> {
  const rows = await db
    .select({ permission: rolePermissions.permission })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId));
  return rows.map((row) => row.permission);
}

export async function roleSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(roles.slug, slug), ne(roles.id, excludeId))
      : eq(roles.slug, slug);
  const rows = await db
    .select({ id: roles.id })
    .from(roles)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function countMembersByRole(roleId: number) {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(members)
    .where(eq(members.roleId, roleId));
  return rows[0]?.count ?? 0;
}

export async function insertRole(input: {
  slug: string;
  name: string;
  isSystem: boolean;
  description?: string;
}) {
  const result = await db
    .insert(roles)
    .values({
      slug: input.slug,
      name: input.name,
      isSystem: input.isSystem,
      description: input.description ?? "",
    })
    .returning({ id: roles.id });

  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert role");
  return id;
}

export async function insertRolePermissions(
  roleId: number,
  permissions: Permission[],
) {
  if (permissions.length === 0) return;
  await db
    .insert(rolePermissions)
    .values(permissions.map((permission) => ({ roleId, permission })));
}

export async function updateRole(
  id: number,
  input: { name: string; description: string },
) {
  await db
    .update(roles)
    .set({ name: input.name, description: input.description })
    .where(eq(roles.id, id));
}

export async function deleteRole(id: number) {
  const role = await findRoleById(id);
  if (!role || role.isSystem) {
    throw new Error("Cannot delete system role");
  }
  const memberCount = await countMembersByRole(id);
  if (memberCount > 0) {
    throw new Error("این نقش به اعضا اختصاص داده شده است.");
  }
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
  await db.delete(roles).where(eq(roles.id, id));
}

export async function replaceRolePermissions(
  roleId: number,
  permissions: Permission[],
) {
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  await insertRolePermissions(roleId, permissions);
}
