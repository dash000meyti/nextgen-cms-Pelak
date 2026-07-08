import type { ContentGroupStatus } from "@nextgen-cms/contract/content-group-status";
import { getContentGroupModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listContentGroupsAdmin } from "@nextgen-cms/studio/cms/queries";
import { ContentGroupAdminList } from "@/components/admin/studio/lists/ContentGroupAdminList";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminContentGroupsPage({
  searchParams,
}: PageProps) {
  await requirePermission("modules.contentGroup.view");
  const { status: statusParam } = await searchParams;
  const status =
    (statusParam as ContentGroupStatus | "all" | undefined) ?? "all";
  const [groups, settings] = await Promise.all([
    listContentGroupsAdmin(status),
    getContentGroupModuleSettings(),
  ]);

  return (
    <ContentGroupAdminList
      groups={groups}
      status={status}
      pageTitle={settings.pageTitle}
    />
  );
}
