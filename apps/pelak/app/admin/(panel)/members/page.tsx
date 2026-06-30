import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import { listMembersAdmin } from "@nextgen-cms/studio/cms/queries";
import { DocumentList } from "@/components/admin/studio/DocumentList";

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
        isActive ? "bg-accent-soft text-accent" : "bg-surface-2 text-ink-faint"
      }`}
    >
      {isActive ? "فعال" : "غیرفعال"}
    </span>
  );
}

export default async function AdminMembersPage() {
  const [members, session] = await Promise.all([
    listMembersAdmin(),
    getMemberSession(),
  ]);
  const canEdit = session?.permissions.includes("members.edit") ?? false;

  return (
    <DocumentList
      title="اعضا"
      newHref="/admin/members/new"
      newLabel="عضؤ جدید"
      rows={members}
      rowKey={(row) => row.id}
      editHref={canEdit ? (row) => `/admin/members/${row.id}/edit` : undefined}
      columns={[
        {
          key: "avatar",
          header: "",
          className: "w-16",
          headerClassName: "w-16 p-0",
          cellClassName: "w-16 p-0",
          render: (row) => (
            <div className="size-16 overflow-hidden bg-surface-2">
              {row.avatarSrc ? (
                // biome-ignore lint/performance/noImgElement: admin upload URLs may be session-gated
                <img
                  src={row.avatarSrc}
                  alt={row.avatarAlt || row.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
          ),
        },
        {
          key: "name",
          header: "نام",
          cellClassName: "py-3 pe-4 ps-0",
          render: (row) => (
            <div>
              <p className="font-medium">{row.name}</p>
              <p className="text-xs text-ink-faint" dir="ltr">
                {row.slug}
              </p>
            </div>
          ),
        },
        {
          key: "email",
          header: "ایمیل",
          render: (row) => (
            <span dir="ltr" className="text-sm text-ink-muted">
              {row.email || "—"}
            </span>
          ),
        },
        {
          key: "role",
          header: "نقش سیستمی",
          render: (row) => row.roleName,
        },
        {
          key: "status",
          header: "وضعیت",
          render: (row) => <ActiveBadge isActive={row.isActive} />,
        },
        {
          key: "content",
          header: "محتوا",
          render: (row) => row.articleCount.toLocaleString("fa-IR"),
        },
      ]}
    />
  );
}
