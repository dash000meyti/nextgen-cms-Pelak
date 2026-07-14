"use server";

import type { Permission } from "@nextgen-cms/contract/permissions";
import {
  isDeprecatedPermission,
  permissionValues,
} from "@nextgen-cms/contract/permissions";
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
import {
  type MutationResult,
  mutationIssue,
} from "@nextgen-cms/studio/cms/mutations/mutation-result";
import {
  issue,
  normalizeSlugInput,
  type ValidationIssue,
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

function sanitizeAssignablePermissions(
  permissions: Permission[],
): Permission[] {
  return permissions.filter((perm) => !isDeprecatedPermission(perm));
}

function mergePreservedDeprecatedPermissions(
  submitted: Permission[],
  existing: Permission[],
): Permission[] {
  const deprecatedKept = existing.filter(isDeprecatedPermission);
  return [
    ...new Set([
      ...sanitizeAssignablePermissions(submitted),
      ...deprecatedKept,
    ]),
  ];
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
): Promise<ValidationIssue | undefined> {
  const normalizedSlug = normalizeSlugInput(data.slug);

  const nameError = validateRequired(data.name, "نام", "name");
  if (nameError) return nameError;

  const slugError = validateSlug(normalizedSlug);
  if (slugError) return slugError;

  if (await roleSlugExists(normalizedSlug, options.excludeId)) {
    return issue("slug", "این شناسه قبلاً استفاده شده است.");
  }

  for (const perm of data.permissions) {
    if (isDeprecatedPermission(perm)) {
      return issue("permissions", `مجوز منسوخ قابل اختصاص نیست: ${perm}`);
    }
    if (!permissionValues.includes(perm)) {
      return issue("permissions", `مجوز نامعتبر: ${perm}`);
    }
  }

  return undefined;
}

export async function createRole(data: RoleFormData): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.roles");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  const error = await validateRoleForm(data, { mode: "create" });
  if (error) return mutationIssue(error);

  try {
    const normalizedSlug = normalizeSlugInput(data.slug);
    const id = await insertRole({
      slug: normalizedSlug,
      name: data.name.trim(),
      description: data.description.trim(),
      isSystem: false,
    });
    await insertRolePermissions(
      id,
      sanitizeAssignablePermissions(data.permissions),
    );
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
    const existingPerms = await getPermissionsForRole(id);
    const permissions = enforceSystemRolePermissions(
      existing.slug,
      mergePreservedDeprecatedPermissions(data.permissions, existingPerms),
    );
    try {
      await replaceRolePermissions(id, permissions);
      return { ok: true, id };
    } catch (err) {
      return handleMutationError(err);
    }
  }

  const error = await validateRoleForm(data, { mode: "edit", excludeId: id });
  if (error) return mutationIssue(error);

  try {
    const existingPerms = await getPermissionsForRole(id);
    await updateRole(id, {
      name: data.name.trim(),
      description: data.description.trim(),
    });
    await replaceRolePermissions(
      id,
      mergePreservedDeprecatedPermissions(data.permissions, existingPerms),
    );
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
  const sessionOrDenied = await requirePermissionMutation("settings.roles");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return null;

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
