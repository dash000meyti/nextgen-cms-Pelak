import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listContentGroupsAdmin } from "@nextgen-cms/studio/cms/queries";
import { ContentGroupAdminList } from "@/components/admin/studio/lists/ContentGroupAdminList";

export default async function AdminContentGroupsPage() {
  await requirePermission("modules.contentGroup.view");
  const groups = await listContentGroupsAdmin();

  return <ContentGroupAdminList groups={groups} />;
}
