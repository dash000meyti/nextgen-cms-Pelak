"use server";

import type { Permission } from "@nextgen-cms/contract/permissions";
import { permissionValues } from "@nextgen-cms/contract/permissions";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  deleteRole,
  findRoleById,
  getPermissionsForRole,
  insertRole,
  insertRolePermissions,
  replaceRolePermissions,
  roleSlugExists,
  updateRole,
} from "@nextgen-cms/core/db/repositories/roles";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import {
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type RoleFormData = {
  slug: string;
  name: string;
  description: string;
  permissions: Permission[];
};

const SYSTEM_ROLE_PROTECTED: Partial<Record<string, Permission[]>> = {
  super_admin: permissionValues,
};

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  throw error;
}

function enforceSystemRolePermissions(
  roleSlug: string,
  permissions: Permission[],
): Permission[] {
  const required = SYSTEM_ROLE_PROTECTED[roleSlug];
  if (!required) return permissions;
  const set = new Set(permissions);
  for (const perm of required) set.add(perm);
  return [...set];
}

async function validateRoleForm(
  data: RoleFormData,
  options: { mode: "create" | "edit"; excludeId?: number },
): Promise<string | undefined> {
  const nameError = validateRequired(data.name, "نام");
  if (nameError) return nameError;

  const slugError = validateSlug(data.slug);
  if (slugError) return slugError;

  if (await roleSlugExists(data.slug, options.excludeId)) {
    return "این شناسه قبلاً استفاده شده است.";
  }

  for (const perm of data.permissions) {
    if (!permissionValues.includes(perm)) {
      return `مجوز نامعتبر: ${perm}`;
    }
  }

  return undefined;
}

export async function createRole(data: RoleFormData): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.roles");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  const error = await validateRoleForm(data, { mode: "create" });
  if (error) return { ok: false, error };

  try {
    const id = await insertRole({
      slug: data.slug.trim(),
      name: data.name.trim(),
      description: data.description.trim(),
      isSystem: false,
    });
    await insertRolePermissions(id, data.permissions);
    return { ok: true, id };
  } catch (err) {
    return handleMutationError(err);
  }
}

export async function saveRole(
  id: number,
  data: RoleFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.roles");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  const existing = await findRoleById(id);
  if (!existing) return { ok: false, error: "نقش یافت نشد." };

  if (existing.isSystem) {
    const permissions = enforceSystemRolePermissions(
      existing.slug,
      data.permissions,
    );
    try {
      await replaceRolePermissions(id, permissions);
      return { ok: true, id };
    } catch (err) {
      return handleMutationError(err);
    }
  }

  const error = await validateRoleForm(data, { mode: "edit", excludeId: id });
  if (error) return { ok: false, error };

  try {
    await updateRole(id, {
      name: data.name.trim(),
      description: data.description.trim(),
    });
    await replaceRolePermissions(id, data.permissions);
    return { ok: true, id };
  } catch (err) {
    return handleMutationError(err);
  }
}

export async function removeRole(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.roles");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  const existing = await findRoleById(id);
  if (!existing) return { ok: false, error: "نقش یافت نشد." };
  if (existing.isSystem) {
    return { ok: false, error: "نقش سیستمی قابل حذف نیست." };
  }

  try {
    await deleteRole(id);
    return { ok: true, id };
  } catch (err) {
    return handleMutationError(err);
  }
}

export async function getRoleFormData(
  id: number,
): Promise<RoleFormData | null> {
  const role = await findRoleById(id);
  if (!role) return null;
  const permissions = await getPermissionsForRole(id);
  return {
    slug: role.slug,
    name: role.name,
    description: role.description,
    permissions,
  };
}

export async function createRoleAndRedirect(data: RoleFormData) {
  const result = await createRole(data);
  if (!result.ok) return result;
  redirect(`/admin/settings/roles?selected=${result.id}`);
}
