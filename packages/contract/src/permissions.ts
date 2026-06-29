export const permissionResources = [
  "content",
  "members",
  "media",
  "settings",
  "modules",
] as const;

export type PermissionResource = (typeof permissionResources)[number];

export const moduleIds = ["contentGroup", "video", "newsletter"] as const;

export type ModuleId = (typeof moduleIds)[number];

export const moduleCrudActions = ["view", "create", "edit", "delete"] as const;

export type ModuleCrudAction = (typeof moduleCrudActions)[number];

export const modulePermissionGroups = [
  {
    id: "contentGroup" as const,
    label: "گروه‌های محتوا",
    actions: [...moduleCrudActions],
  },
  {
    id: "video" as const,
    label: "ویدیو",
    actions: [...moduleCrudActions],
  },
  {
    id: "newsletter" as const,
    label: "خبرنامه",
    actions: ["manage"] as const,
  },
] as const;

export const permissionActions = {
  content: ["create", "edit_own", "edit_all", "publish"],
  members: ["create", "edit", "delete"],
  media: ["upload", "delete_own", "delete_all", "manage_all"],
  settings: [
    "site",
    "theme",
    "modules",
    "roles",
    /** @deprecated Use `settings.content` for topic CRUD; kept for additive migration */
    "topics",
    "content",
    "members",
    "media",
    "personal",
  ],
  modules: modulePermissionGroups.flatMap((group) =>
    group.actions.map((action) => `${group.id}.${action}`),
  ),
} as const satisfies Record<PermissionResource, readonly string[]>;

type ActionForResource<R extends PermissionResource> =
  (typeof permissionActions)[R][number];

export type PermissionAction = ActionForResource<PermissionResource>;

export type Permission = {
  [R in PermissionResource]: `${R}.${ActionForResource<R>}`;
}[PermissionResource];

function buildPermissionValues(): Permission[] {
  const values: Permission[] = [];
  for (const resource of permissionResources) {
    for (const action of permissionActions[resource]) {
      values.push(`${resource}.${action}` as Permission);
    }
  }
  return values;
}

export const permissionValues = buildPermissionValues();

/** Module permissions granted when a role had legacy `settings.content` access */
export const settingsContentModuleBackfillPermissions = modulePermissionGroups
  .filter((group) => group.id === "contentGroup" || group.id === "video")
  .flatMap((group) =>
    group.actions.map(
      (action) => `modules.${group.id}.${action}` as Permission,
    ),
  );

export function modulePermission(
  moduleId: ModuleId,
  action: string,
): Permission {
  return `modules.${moduleId}.${action}` as Permission;
}
