import {
  type Permission,
  permissionActions,
  permissionValues,
  settingsContentModuleBackfillPermissions,
} from "./permissions";

export const defaultRoleSlugs = [
  "super_admin",
  "editor_in_chief",
  "writer",
] as const;

export type DefaultRoleSlug = (typeof defaultRoleSlugs)[number];

export const defaultRoleLabels: Record<DefaultRoleSlug, string> = {
  super_admin: "مدیر کل",
  editor_in_chief: "سردبیر",
  writer: "عضو",
};

const contentPermissions = permissionActions.content.map(
  (action) => `content.${action}` as Permission,
);

const mediaPermissions = permissionActions.media.map(
  (action) => `media.${action}` as Permission,
);

export const defaultRolePermissions: Record<DefaultRoleSlug, Permission[]> = {
  super_admin: [...permissionValues],
  editor_in_chief: [
    ...contentPermissions,
    "members.create",
    ...mediaPermissions,
    "settings.content",
    "settings.modules",
    "settings.personal",
    ...settingsContentModuleBackfillPermissions,
    "modules.newsletter.manage",
    "messages.view",
    "messages.edit",
    "settings.messages",
  ],
  writer: [
    "content.create",
    "content.edit_own",
    "media.upload",
    "media.delete_own",
    "settings.personal",
  ],
};
