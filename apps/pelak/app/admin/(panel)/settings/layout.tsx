import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import {
  getFirstSettingsTabHref,
  getPermittedSettingsTabs,
  hasAnySettingsPermission,
} from "@nextgen-cms/studio/admin/settings-tabs";
import type { Metadata } from "next";
import { forbidden } from "next/navigation";
import { SettingsNav } from "@/components/admin/studio/SettingsNav";

export const metadata: Metadata = {
  title: "تنظیمات",
  robots: { index: false, follow: false },
};

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getMemberSession();
  if (!session) forbidden();
  if (!hasAnySettingsPermission(session.permissions)) forbidden();

  const tabs = getPermittedSettingsTabs(session.permissions);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">تنظیمات</h1>
      <SettingsNav tabs={tabs} />
      {children}
    </div>
  );
}

export async function getSettingsRedirectHref() {
  const session = await getMemberSession();
  if (!session) return "/admin/login";
  return getFirstSettingsTabHref(session.permissions);
}
