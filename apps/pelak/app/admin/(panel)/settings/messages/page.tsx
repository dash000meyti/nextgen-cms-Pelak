import { getMessagesSettings } from "@nextgen-cms/site-data/messages";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { Metadata } from "next";
import { MessagesSettingsForm } from "@/components/admin/studio/MessagesSettingsForm";

export const metadata: Metadata = {
  title: "پیام‌ها — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function MessagesSettingsPage() {
  await requirePermission("settings.messages");
  const messagesSettings = await getMessagesSettings();

  return <MessagesSettingsForm value={messagesSettings} />;
}
