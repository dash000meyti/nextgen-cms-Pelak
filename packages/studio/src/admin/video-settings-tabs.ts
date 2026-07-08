export type VideoSettingsTabId = "video" | "playlists";

export type VideoSettingsTab = {
  id: VideoSettingsTabId;
  label: string;
  href: string;
};

export const VIDEO_SETTINGS_TABS: VideoSettingsTab[] = [
  { id: "video", label: "تنظیمات", href: "/admin/videos/settings/video" },
  {
    id: "playlists",
    label: "لیست پخش",
    href: "/admin/videos/settings/playlists",
  },
];

export function getFirstVideoSettingsTabHref() {
  return VIDEO_SETTINGS_TABS[0]?.href ?? "/admin/videos/settings/video";
}
