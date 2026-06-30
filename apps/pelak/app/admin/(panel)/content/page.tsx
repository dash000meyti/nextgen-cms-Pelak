import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { listArticlesAdmin } from "@nextgen-cms/studio/cms/queries";
import Link from "next/link";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { DocumentListThumbnail } from "@/components/admin/studio/DocumentListThumbnail";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const STATUS_OPTIONS: { value: ArticleStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "published", label: "منتشرشده" },
  { value: "archived", label: "بایگانی" },
];

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status = (statusParam as ArticleStatus | "all" | undefined) ?? "all";
  const articles = await listArticlesAdmin(status);

  return (
    <DocumentList
      title="محتوا"
      newHref="/admin/content/new"
      newLabel="محتوای جدید"
      rows={articles}
      rowKey={(row) => row.id}
      editHref={(row) => `/admin/content/${row.id}/edit`}
      viewHref={(row) =>
        row.status === "published"
          ? `/content/${row.slug}`
          : `/admin/content/${row.id}/preview`
      }
      toolbar={
        <div className="flex flex-wrap gap-2">
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
        </div>
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
        {
          key: "title",
          header: "عنوان",
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
          render: (row) => row.authorNames || "—",
        },
        {
          key: "status",
          header: "وضعیت",
          render: (row) => <StatusBadge status={row.status} />,
        },
        {
          key: "updated",
          header: "به‌روزرسانی",
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
