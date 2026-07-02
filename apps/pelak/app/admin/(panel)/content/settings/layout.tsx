import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentSettings } from "@nextgen-cms/site-data/get-content";
import { CONTENT_SETTINGS_TABS } from "@nextgen-cms/studio/admin/content-settings-tabs";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import Link from "next/link";
import { SettingsNav } from "@/components/admin/studio/SettingsNav";

export const metadata: Metadata = {
  title: "تنظیمات محتوا",
  robots: { index: false, follow: false },
};

export default async function ContentSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePermission("settings.content");
  const contentSettings = await getContentSettings();
  const labels = sectionAdminLabels(contentSettings.pageTitle);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">{labels.settings}</h1>
        <Link
          href="/admin/content"
          className="text-sm text-ink-muted hover:text-accent"
        >
          {labels.backToList}
        </Link>
      </div>
      <SettingsNav tabs={CONTENT_SETTINGS_TABS} />
      {children}
    </div>
  );
}
