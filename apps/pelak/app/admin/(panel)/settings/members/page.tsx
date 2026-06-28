import { getMemberSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listAllRolesForPicker } from "@nextgen-cms/studio/cms/queries/admin";
import type { Metadata } from "next";
import { MemberSettingsForm } from "@/components/admin/studio/MemberSettingsForm";

export const metadata: Metadata = {
  title: "اعضا — تنظیمات",
  robots: { index: false, follow: false },
};

export default async function MemberSettingsPage() {
  await requirePermission("settings.members");
  const [memberSettings, roles] = await Promise.all([
    getMemberSettings(),
    listAllRolesForPicker(),
  ]);

  return <MemberSettingsForm value={memberSettings} roles={roles} />;
}
