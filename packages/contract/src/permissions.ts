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
    "database",
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

/** Permissions kept in DB for additive migration but not assignable in roles UI */
export const deprecatedPermissions = [
  "settings.topics",
] as const satisfies readonly Permission[];

export function isDeprecatedPermission(perm: Permission): boolean {
  return (deprecatedPermissions as readonly Permission[]).includes(perm);
}

export const assignablePermissionValues = permissionValues.filter(
  (perm) => !isDeprecatedPermission(perm),
);

export const permissionActionLabels: Record<string, string> = {
  create: "ایجاد",
  edit_own: "ویرایش خود",
  edit_all: "ویرایش همه",
  publish: "انتشار",
  edit: "ویرایش",
  delete: "حذف",
  upload: "آپلود",
  delete_own: "حذف خود",
  delete_all: "حذف همه",
  manage_all: "مدیریت کامل",
  manage: "مدیریت",
  view: "مشاهده",
  site: "سایت",
  theme: "رنگ‌ها",
  modules: "ماژول‌ها",
  roles: "نقش‌ها",
  topics: "موضوعات",
  content: "محتوا",
  members: "اعضا",
  media: "مدیا",
  personal: "شخصی",
  database: "پایگاه داده",
};

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
