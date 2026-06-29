import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listContentGroupsAdmin } from "@nextgen-cms/studio/cms/queries";
import { DocumentList } from "@/components/admin/studio/DocumentList";

export default async function AdminContentGroupsPage() {
  await requirePermission("modules.contentGroup.view");
  const groups = await listContentGroupsAdmin();

  return (
    <DocumentList
      title="گروه‌های محتوا"
      newHref="/admin/content-group/new"
      newLabel="گروه محتوای جدید"
      rows={groups}
      rowKey={(row) => row.id}
      editHref={(row) => `/admin/content-group/${row.id}/edit`}
      columns={[
        {
          key: "number",
          header: "شماره",
          render: (row) => row.number.toLocaleString("fa-IR"),
        },
        { key: "label", header: "برچسب", render: (row) => row.label },
        {
          key: "season",
          header: "فصل / سال",
          render: (row) => `${row.season} ${row.year.toLocaleString("fa-IR")}`,
        },
      ]}
    />
  );
}
