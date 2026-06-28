import { getSiteConfig } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { SiteSettingsForm } from "@/components/admin/studio/SiteSettingsForm";

export const metadata: Metadata = {
  title: "سایت — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function SiteSettingsPage() {
  await requirePermission("settings.site");
  const siteConfig = await getSiteConfig();

  return <SiteSettingsForm siteConfig={siteConfig} />;
}
