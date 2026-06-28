import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import { listVideosAdmin } from "@nextgen-cms/studio/cms/queries";
import { DocumentList } from "@/components/admin/studio/DocumentList";

export default async function AdminVideosPage() {
  await requirePermission("modules.video.view");
  const videos = await listVideosAdmin();

  return (
    <DocumentList
      title="ویدیوها"
      newHref="/admin/videos/new"
      newLabel="ویدیو جدید"
      rows={videos}
      rowKey={(row) => row.id}
      editHref={(row) => `/admin/videos/${row.id}/edit`}
      columns={[
        {
          key: "title",
          header: "عنوان",
          render: (row) => (
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-ink-faint" dir="ltr">
                {row.slug}
              </p>
            </div>
          ),
        },
        {
          key: "duration",
          header: "مدت",
          render: (row) => row.duration || "—",
        },
      ]}
    />
  );
}
