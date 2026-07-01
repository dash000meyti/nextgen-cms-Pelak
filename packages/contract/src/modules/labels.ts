import type { ModuleId } from "@nextgen-cms/contract/permissions";
import { modulePermissionGroups } from "@nextgen-cms/contract/permissions";
import type { ModuleSettings } from "@nextgen-cms/contract/types/modules";

export function getModuleAdminLabel(
  moduleId: ModuleId,
  settings: ModuleSettings,
): string {
  const custom = settings[moduleId]?.label?.trim();
  if (custom) return custom;
  const group = modulePermissionGroups.find((g) => g.id === moduleId);
  return group?.label ?? moduleId;
}

export function getModuleAdminLabelPlaceholder(moduleId: ModuleId): string {
  const group = modulePermissionGroups.find((g) => g.id === moduleId);
  return group?.label ?? moduleId;
}
