import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listIssuesAdmin } from "@nextgen-cms/studio/cms/queries";
import { DocumentList } from "@/components/admin/studio/DocumentList";

export default async function AdminIssuesPage() {
  await requirePermission("modules.issues.view");
  const issues = await listIssuesAdmin();

  return (
    <DocumentList
      title="شماره‌ها"
      newHref="/admin/issues/new"
      newLabel="شمارهٔ جدید"
      rows={issues}
      rowKey={(row) => row.id}
      editHref={(row) => `/admin/issues/${row.id}/edit`}
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
