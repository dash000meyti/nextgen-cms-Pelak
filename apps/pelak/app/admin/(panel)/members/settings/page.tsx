import { getMemberSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listAllRolesForPicker } from "@nextgen-cms/studio/cms/queries/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { MemberSettingsForm } from "@/components/admin/studio/MemberSettingsForm";

export const metadata: Metadata = {
  title: "تنظیمات اعضا",
  robots: { index: false, follow: false },
};

export default async function MemberSectionSettingsPage() {
  await requirePermission("settings.members");
  const [memberSettings, roles] = await Promise.all([
    getMemberSettings(),
    listAllRolesForPicker(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl text-ink">تنظیمات اعضا</h1>
        <Link
          href="/admin/members"
          className="text-sm text-ink-muted hover:text-accent"
        >
          بازگشت به اعضا
        </Link>
      </div>
      <MemberSettingsForm value={memberSettings} roles={roles} />
    </div>
  );
}
