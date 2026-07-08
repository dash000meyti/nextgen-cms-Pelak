"use client";

import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import type { VideoStatus } from "@nextgen-cms/contract/video-status";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import Link from "next/link";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { DocumentListThumbnail } from "@/components/admin/studio/DocumentListThumbnail";
import { idColumn } from "@/components/admin/studio/document-list-columns";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";

export type VideosAdminListRow = {
  id: number;
  slug: string;
  title: string;
  thumbnailSrc: string | null;
  thumbnailAlt: string | null;
  duration: string | null;
  publishedAt: string | null;
  status: VideoStatus;
};

type VideosAdminListProps = {
  videos: VideosAdminListRow[];
  status: VideoStatus | "all";
};

const STATUS_OPTIONS: { value: VideoStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشرشده" },
  { value: "archived", label: "بایگانی" },
];

export function VideosAdminList({ videos, status }: VideosAdminListProps) {
  const { sectionPageTitles } = useAdminMember();
  const labels = sectionAdminLabels(sectionPageTitles.video);

  return (
    <DocumentList
      title={labels.listTitle}
      newHref="/admin/videos/new"
      newLabel={labels.newItem}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = option.value === status;
            const href =
              option.value === "all"
                ? "/admin/videos"
                : `/admin/videos?status=${option.value}`;
            return (
              <Link
                key={option.value}
                href={href}
                className={`rounded border px-2 py-1 text-xs ${
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-rule text-ink-muted hover:text-ink"
                }`}
              >
                {option.label}
              </Link>
            );
          })}
          <SectionSettingsLink href="/admin/videos/settings/video" />
        </div>
      }
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
          key: "status",
          header: "وضعیت",
          sortable: true,
          sortValue: (row) => row.status,
          render: (row) => <StatusBadge status={row.status} />,
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
