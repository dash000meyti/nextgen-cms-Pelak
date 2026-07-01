"use client";

import { DocumentList } from "@/components/admin/studio/DocumentList";
import { idColumn } from "@/components/admin/studio/document-list-columns";

export type TopicsAdminListRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

type TopicsAdminListProps = {
  topics: TopicsAdminListRow[];
};

export function TopicsAdminList({ topics }: TopicsAdminListProps) {
  return (
    <DocumentList
      title=""
      newHref="/admin/content/topics/new"
      newLabel="موضوع جدید"
      rows={topics}
      rowKey={(row) => row.id}
      defaultSort={{ key: "name", direction: "asc" }}
      editHref={(row) => `/admin/content/topics/${row.id}/edit`}
      columns={[
        idColumn<TopicsAdminListRow>(),
        {
          key: "name",
          header: "نام",
          sortable: true,
          sortValue: (row) => row.name,
          searchText: (row) => `${row.name} ${row.slug}`,
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
          key: "description",
          header: "توضیحات",
          sortable: true,
          sortValue: (row) => row.description ?? "",
          searchText: (row) => row.description ?? "",
          render: (row) => row.description || "—",
        },
      ]}
    />
  );
}
