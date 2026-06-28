import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listRolesAdmin } from "@nextgen-cms/studio/cms/queries/admin";
import type { Metadata } from "next";
import { RolesSettingsPanel } from "@/components/admin/studio/RolesSettingsPanel";

export const metadata: Metadata = {
  title: "نقش‌ها — تنظیمات",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ selected?: string }>;
};

export default async function RolesSettingsPage({ searchParams }: PageProps) {
  await requirePermission("settings.roles");
  const roles = await listRolesAdmin();
  const params = await searchParams;
  const selectedId = params.selected
    ? Number.parseInt(params.selected, 10)
    : undefined;

  return <RolesSettingsPanel roles={roles} selectedId={selectedId} />;
}
