import type { Permission } from "@nextgen-cms/contract/permissions";

export type SettingsTabId =
  | "personal"
  | "site"
  | "theme"
  | "roles"
  | "content"
  | "members"
  | "media"
  | "modules";

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
  href: string;
  permission: Permission;
};

export const SETTINGS_TABS: SettingsTab[] = [
  {
    id: "personal",
    label: "اطلاعات شخصی",
    href: "/admin/settings/personal",
    permission: "settings.personal",
  },
  {
    id: "site",
    label: "سایت",
    href: "/admin/settings/site",
    permission: "settings.site",
  },
  {
    id: "theme",
    label: "رنگ‌ها",
    href: "/admin/settings/theme",
    permission: "settings.theme",
  },
  {
    id: "roles",
    label: "نقش‌ها",
    href: "/admin/settings/roles",
    permission: "settings.roles",
  },
  {
    id: "content",
    label: "محتوا",
    href: "/admin/settings/content",
    permission: "settings.content",
  },
  {
    id: "members",
    label: "اعضا",
    href: "/admin/settings/members",
    permission: "settings.members",
  },
  {
    id: "media",
    label: "مدیا",
    href: "/admin/settings/media",
    permission: "settings.media",
  },
  {
    id: "modules",
    label: "ماژول‌ها",
    href: "/admin/settings/modules",
    permission: "settings.modules",
  },
];

export function getPermittedSettingsTabs(
  permissions: Permission[],
): SettingsTab[] {
  return SETTINGS_TABS.filter((tab) => permissions.includes(tab.permission));
}

export function getFirstSettingsTabHref(permissions: Permission[]): string {
  const tabs = getPermittedSettingsTabs(permissions);
  return tabs[0]?.href ?? "/admin";
}

export function hasAnySettingsPermission(permissions: Permission[]): boolean {
  return getPermittedSettingsTabs(permissions).length > 0;
}
