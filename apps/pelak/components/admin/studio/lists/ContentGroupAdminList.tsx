"use client";

import type { ContentGroupStatus } from "@nextgen-cms/contract/content-group-status";
import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import Link from "next/link";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { idColumn } from "@/components/admin/studio/document-list-columns";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";

export type ContentGroupAdminListRow = {
  id: number;
  slug: string;
  title: string;
  status: ContentGroupStatus;
  publishedAt: string;
};

const STATUS_OPTIONS: { value: ContentGroupStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشرشده" },
  { value: "archived", label: "بایگانی" },
];

type ContentGroupAdminListProps = {
  groups: ContentGroupAdminListRow[];
  status: ContentGroupStatus | "all";
  pageTitle: string;
};

export function ContentGroupAdminList({
  groups,
  status,
  pageTitle,
}: ContentGroupAdminListProps) {
  const { sectionPageTitles } = useAdminMember();
  const labels = sectionAdminLabels(
    pageTitle || sectionPageTitles.contentGroup,
  );
  const isArchivedTab = status === "archived";

  return (
    <DocumentList
      title={labels.listTitle}
      newHref="/admin/content-group/new"
      newLabel={labels.newItem}
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={
                option.value === "all"
                  ? "/admin/content-group"
                  : `/admin/content-group?status=${option.value}`
              }
              className={`rounded px-3 py-1.5 text-xs ${
                status === option.value
                  ? "bg-accent-soft text-accent"
                  : "border border-rule text-ink-muted hover:text-ink"
              }`}
            >
              {option.label}
            </Link>
          ))}
          <SectionSettingsLink href="/admin/content-group/settings" />
        </div>
      }
      rows={groups}
      rowKey={(row) => row.id}
      defaultSort={{ key: "publishedAt", direction: "desc" }}
      editHref={
        isArchivedTab
          ? undefined
          : (row) => `/admin/content-group/${row.id}/edit`
      }
      columns={[
        idColumn<ContentGroupAdminListRow>(),
        {
          key: "slug",
          header: "نامک",
          sortable: true,
          sortValue: (row) => row.slug,
          searchText: (row) => row.slug,
          render: (row) => row.slug,
        },
        {
          key: "title",
          header: "عنوان",
          sortable: true,
          sortValue: (row) => row.title,
          searchText: (row) => row.title,
          render: (row) => row.title,
        },
        {
          key: "status",
          header: "وضعیت",
          sortable: true,
          sortValue: (row) => row.status,
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "publishedAt",
          header: "تاریخ انتشار",
          sortable: true,
          sortValue: (row) => row.publishedAt,
          render: (row) => row.publishedAt,
        },
      ]}
    />
  );
}
