"use client";

import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";
import { idColumn } from "@/components/admin/studio/document-list-columns";

export type MembersAdminListRow = {
  id: number;
  slug: string;
  name: string;
  email: string | null;
  avatarSrc: string | null;
  avatarAlt: string | null;
  isActive: boolean;
  roleName: string;
  articleCount: number;
};

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

type MembersAdminListProps = {
  members: MembersAdminListRow[];
  canEdit: boolean;
};

export function MembersAdminList({ members, canEdit }: MembersAdminListProps) {
  const { permissions } = useAdminMember();
  const canManageSettings = permissions.includes("settings.members");

  return (
    <DocumentList
      title="اعضا"
      newHref="/admin/members/new"
      newLabel="عضؤ جدید"
      toolbar={
        canManageSettings ? (
          <SectionSettingsLink href="/admin/members/settings" />
        ) : null
      }
      rows={members}
      rowKey={(row) => row.id}
      defaultSort={{ key: "name", direction: "asc" }}
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
        idColumn<MembersAdminListRow>(),
        {
          key: "name",
          header: "نام",
          sortable: true,
          sortValue: (row) => row.name,
          searchText: (row) => `${row.name} ${row.slug}`,
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
          sortable: true,
          sortValue: (row) => row.email ?? "",
          searchText: (row) => row.email ?? "",
          render: (row) => (
            <span dir="ltr" className="text-sm text-ink-muted">
              {row.email || "—"}
            </span>
          ),
        },
        {
          key: "role",
          header: "نقش سیستمی",
          sortable: true,
          sortValue: (row) => row.roleName,
          searchText: (row) => row.roleName,
          render: (row) => row.roleName,
        },
        {
          key: "status",
          header: "وضعیت",
          sortable: true,
          sortValue: (row) => (row.isActive ? 1 : 0),
          render: (row) => <ActiveBadge isActive={row.isActive} />,
        },
        {
          key: "content",
          header: "محتوا",
          sortable: true,
          sortValue: (row) => row.articleCount,
          render: (row) => row.articleCount.toLocaleString("fa-IR"),
        },
      ]}
    />
  );
}
