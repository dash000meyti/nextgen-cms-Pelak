"use client";

import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { useAdminMember } from "@nextgen-cms/studio/admin/admin-member-context";
import Link from "next/link";
import { DeleteArchivedArticleButton } from "@/components/admin/studio/DeleteArchivedArticleButton";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { DocumentListThumbnail } from "@/components/admin/studio/DocumentListThumbnail";
import { idColumn } from "@/components/admin/studio/document-list-columns";
import { RestoreArticleButton } from "@/components/admin/studio/RestoreArticleButton";
import { SectionSettingsLink } from "@/components/admin/studio/SectionSettingsLink";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";
import { TableActionLink } from "@/components/admin/studio/TableActionButton";

export type ContentAdminListRow = {
  id: number;
  slug: string;
  title: string;
  heroSrc: string | null;
  heroAlt: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  authorNames: string;
};

const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشرشده" },
  { value: "archived", label: "بایگانی" },
];

type ContentAdminListProps = {
  articles: ContentAdminListRow[];
  status: ArticleStatus | "all";
};

export function ContentAdminList({ articles, status }: ContentAdminListProps) {
  const isArchivedTab = status === "archived";
  const { permissions } = useAdminMember();
  const canManageSettings = permissions.includes("settings.content");
  const canCreate = permissions.includes("content.create");

  return (
    <DocumentList
      title="محتوا"
      newHref={canCreate ? "/admin/content/new" : undefined}
      newLabel="محتوای جدید"
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={
                option.value === "all"
                  ? "/admin/content"
                  : `/admin/content?status=${option.value}`
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
          {canManageSettings ? (
            <SectionSettingsLink href="/admin/content/settings" />
          ) : null}
        </div>
      }
      rows={articles}
      rowKey={(row) => row.id}
      defaultSort={{ key: "updated", direction: "desc" }}
      editHref={
        isArchivedTab ? undefined : (row) => `/admin/content/${row.id}/edit`
      }
      viewHref={(row) =>
        row.status === "published"
          ? `/content/${row.slug}`
          : `/admin/content/${row.id}/preview`
      }
      renderActions={
        isArchivedTab
          ? (row) => (
              <>
                <TableActionLink
                  href={`/admin/content/${row.id}/preview`}
                  target="_blank"
                  rel="noreferrer"
                  label="مشاهده"
                  icon="view"
                />
                <RestoreArticleButton articleId={row.id} />
                <DeleteArchivedArticleButton articleId={row.id} />
              </>
            )
          : undefined
      }
      columns={[
        {
          key: "thumb",
          header: "",
          className: "w-12",
          headerClassName: "!p-0 w-12",
          cellClassName: "!p-0 w-12",
          render: (row) => (
            <DocumentListThumbnail
              src={row.heroSrc}
              alt={row.heroAlt || row.title}
            />
          ),
        },
        idColumn<ContentAdminListRow>(),
        {
          key: "title",
          header: "عنوان",
          sortable: true,
          sortValue: (row) => row.title,
          searchText: (row) => `${row.title} ${row.slug}`,
          render: (row) => (
            <div className="min-w-0">
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-ink-faint" dir="ltr">
                {row.slug}
              </p>
            </div>
          ),
        },
        {
          key: "authors",
          header: "اعضا",
          sortable: true,
          sortValue: (row) => row.authorNames,
          searchText: (row) => row.authorNames,
          render: (row) => row.authorNames || "—",
        },
        {
          key: "status",
          header: "وضعیت",
          sortable: true,
          sortValue: (row) => row.status,
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "updated",
          header: "به‌روزرسانی",
          sortable: true,
          sortValue: (row) => new Date(row.updatedAt),
          render: (row) =>
            new Date(row.updatedAt).toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
        },
      ]}
    />
  );
}
