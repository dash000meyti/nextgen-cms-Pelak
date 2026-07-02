import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { DatabaseSettingsPanel } from "@/components/admin/studio/DatabaseSettingsPanel";

export const metadata: Metadata = {
  title: "پایگاه داده — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function DatabaseSettingsPage() {
  await requirePermission("settings.database");
  return <DatabaseSettingsPanel />;
}
