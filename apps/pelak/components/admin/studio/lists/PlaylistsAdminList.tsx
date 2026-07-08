"use client";

import { DocumentList } from "@/components/admin/studio/DocumentList";
import { DocumentListThumbnail } from "@/components/admin/studio/DocumentListThumbnail";
import { idColumn } from "@/components/admin/studio/document-list-columns";

export type PlaylistsAdminListRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  coverSrc: string;
  coverAlt: string;
};

type PlaylistsAdminListProps = {
  playlists: PlaylistsAdminListRow[];
};

export function PlaylistsAdminList({ playlists }: PlaylistsAdminListProps) {
  return (
    <DocumentList
      title=""
      newHref="/admin/videos/playlists/new"
      newLabel="لیست پخش جدید"
      rows={playlists}
      rowKey={(row) => row.id}
      defaultSort={{ key: "name", direction: "asc" }}
      editHref={(row) => `/admin/videos/playlists/${row.id}/edit`}
      columns={[
        {
          key: "cover",
          header: "",
          className: "w-12",
          headerClassName: "!p-0 w-12",
          cellClassName: "!p-0 w-12",
          render: (row) => (
            <DocumentListThumbnail
              src={row.coverSrc}
              alt={row.coverAlt || row.name}
            />
          ),
        },
        idColumn<PlaylistsAdminListRow>(),
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
          sortValue: (row) => row.description,
          searchText: (row) => row.description,
          render: (row) => row.description || "—",
        },
      ]}
    />
  );
}
