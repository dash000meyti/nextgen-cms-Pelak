"use client";

import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { DocumentListThumbnail } from "@/components/admin/studio/DocumentListThumbnail";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";
import { idColumn } from "@/components/admin/studio/document-list-columns";

export type VideosAdminListRow = {
  id: number;
  slug: string;
  title: string;
  thumbnailSrc: string | null;
  thumbnailAlt: string | null;
  duration: string | null;
  publishedAt: string | null;
};

type VideosAdminListProps = {
  videos: VideosAdminListRow[];
};

export function VideosAdminList({ videos }: VideosAdminListProps) {
  const { sectionPageTitles } = useAdminMember();
  const labels = sectionAdminLabels(sectionPageTitles.video);

  return (
    <DocumentList
      title={labels.listTitle}
      newHref="/admin/videos/new"
      newLabel={labels.newItem}
      toolbar={<SectionSettingsLink href="/admin/videos/settings" />}
      rows={videos}
      rowKey={(row) => row.id}
      defaultSort={{ key: "publishedAt", direction: "asc" }}
      editHref={(row) => `/admin/videos/${row.id}/edit`}
      columns={[
        {
          key: "thumb",
          header: "",
          className: "w-12",
          headerClassName: "!p-0 w-12",
          cellClassName: "!p-0 w-12",
          render: (row) => (
            <DocumentListThumbnail
              src={row.thumbnailSrc}
              alt={row.thumbnailAlt || row.title}
            />
          ),
        },
        idColumn<VideosAdminListRow>(),
        {
          key: "title",
          header: "عنوان",
          sortable: true,
          sortValue: (row) => row.title,
          searchText: (row) => `${row.title} ${row.slug}`,
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
          sortable: true,
          sortValue: (row) => row.duration ?? "",
          render: (row) => row.duration || "—",
        },
        {
          key: "publishedAt",
          header: "انتشار",
          sortable: true,
          sortValue: (row) =>
            row.publishedAt ? new Date(row.publishedAt) : null,
          render: (row) =>
            row.publishedAt
              ? new Date(row.publishedAt).toLocaleDateString("fa-IR", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—",
        },
      ]}
    />
  );
}
