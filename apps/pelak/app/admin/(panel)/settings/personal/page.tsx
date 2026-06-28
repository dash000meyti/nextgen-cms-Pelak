import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { getCurrentMemberProfile } from "@nextgen-cms/studio/cms/queries";
import type { Metadata } from "next";
import { PersonalSettingsForm } from "@/components/admin/studio/PersonalSettingsForm";

export const metadata: Metadata = {
  title: "اطلاعات شخصی — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function PersonalSettingsPage() {
  await requirePermission("settings.personal");
  const memberProfile = await getCurrentMemberProfile();
  if (!memberProfile) return null;

  return <PersonalSettingsForm member={memberProfile} />;
}
