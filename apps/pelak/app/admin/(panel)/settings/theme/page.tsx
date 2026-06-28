import { getThemeTokens } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { ThemeSettingsForm } from "@/components/admin/studio/ThemeSettingsForm";

export const metadata: Metadata = {
  title: "رنگ‌ها — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function ThemeSettingsPage() {
  await requirePermission("settings.theme");
  const themeTokens = await getThemeTokens();

  return <ThemeSettingsForm themeTokens={themeTokens} />;
}
