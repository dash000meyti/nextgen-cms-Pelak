export type ContentSettingsTabId = "content" | "topics";

export type ContentSettingsTab = {
  id: ContentSettingsTabId;
  label: string;
  href: string;
};

export const CONTENT_SETTINGS_TABS: ContentSettingsTab[] = [
  {
    id: "content",
    label: "محتوا",
    href: "/admin/content/settings/content",
  },
  {
    id: "topics",
    label: "موضوعات",
    href: "/admin/content/settings/topics",
  },
];

export function getFirstContentSettingsTabHref(): string {
  return CONTENT_SETTINGS_TABS[0]?.href ?? "/admin/content";
}
