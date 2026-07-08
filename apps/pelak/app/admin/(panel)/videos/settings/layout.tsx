import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getVideoModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { VIDEO_SETTINGS_TABS } from "@nextgen-cms/studio/admin/video-settings-tabs";
import type { Metadata } from "next";
import Link from "next/link";
import { SettingsNav } from "@/components/admin/studio/SettingsNav";

export const metadata: Metadata = {
  title: "تنظیمات ویدیو",
  robots: { index: false, follow: false },
};

export default async function VideoSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("modules.video.view");
  const settings = await getVideoModuleSettings();
  const labels = sectionAdminLabels(settings.pageTitle);
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">{labels.settings}</h1>
        <Link
          href="/admin/videos"
          className="text-sm text-ink-muted hover:text-accent"
        >
          {labels.backToList}
        </Link>
      </div>
      <SettingsNav tabs={VIDEO_SETTINGS_TABS} />
      {children}
    </div>
  );
}
