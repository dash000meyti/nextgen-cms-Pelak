import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentGroupModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import Link from "next/link";
import { ContentGroupModuleSettingsForm } from "@/components/admin/studio/ContentGroupModuleSettingsForm";

export const metadata: Metadata = {
  title: "تنظیمات گروه محتوا",
  robots: { index: false, follow: false },
};

export default async function ContentGroupSettingsPage() {
  await requirePermission("modules.contentGroup.view");
  const settings = await getContentGroupModuleSettings();
  const labels = sectionAdminLabels(settings.pageTitle);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">{labels.settings}</h1>
        <Link
          href="/admin/content-group"
          className="text-sm text-ink-muted hover:text-accent"
        >
          {labels.backToList}
        </Link>
      </div>
      <ContentGroupModuleSettingsForm value={settings} />
    </div>
  );
}
