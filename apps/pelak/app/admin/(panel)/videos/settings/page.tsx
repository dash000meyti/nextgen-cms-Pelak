import { getVideoModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import Link from "next/link";
import { VideoModuleSettingsForm } from "@/components/admin/studio/VideoModuleSettingsForm";

export const metadata: Metadata = {
  title: "تنظیمات ویدیو",
  robots: { index: false, follow: false },
};

export default async function VideoSettingsPage() {
  await requirePermission("modules.video.view");
  const settings = await getVideoModuleSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">تنظیمات ویدیو</h1>
        <Link
          href="/admin/videos"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به ویدیوها
        </Link>
      </div>
      <VideoModuleSettingsForm value={settings} />
    </div>
  );
}
