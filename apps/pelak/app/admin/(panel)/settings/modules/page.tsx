import { getModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { ModuleSettingsEditor } from "@/components/admin/studio/ModuleSettingsEditor";

export const metadata: Metadata = {
  title: "ماژول‌ها — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function ModulesSettingsPage() {
  await requirePermission("settings.modules");
  const moduleSettings = await getModuleSettings();

  return <ModuleSettingsEditor value={moduleSettings} />;
}
