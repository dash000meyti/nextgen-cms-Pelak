import { getMediaSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { MediaSettingsForm } from "@/components/admin/studio/MediaSettingsForm";

export const metadata: Metadata = {
  title: "مدیا — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function MediaSettingsPage() {
  await requirePermission("settings.media");
  const mediaSettings = await getMediaSettings();

  return <MediaSettingsForm value={mediaSettings} />;
}
