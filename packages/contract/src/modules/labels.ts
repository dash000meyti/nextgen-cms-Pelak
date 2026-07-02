import type { ModuleId } from "@nextgen-cms/contract/permissions";
import { modulePermissionGroups } from "@nextgen-cms/contract/permissions";

export type SectionAdminLabels = {
  settings: string;
  newItem: string;
  editItem: string;
  listTitle: string;
  backToList: string;
};

export function sectionAdminLabels(pageTitle: string): SectionAdminLabels {
  const title = pageTitle.trim() || "بخش";
  return {
    settings: `تنظیمات ${title}`,
    newItem: `${title} جدید`,
    editItem: `ویرایش ${title}`,
    listTitle: title,
    backToList: `بازگشت به ${title}`,
  };
}

export function getModuleAdminLabelPlaceholder(moduleId: ModuleId): string {
  const group = modulePermissionGroups.find((g) => g.id === moduleId);
  return group?.label ?? moduleId;
}
