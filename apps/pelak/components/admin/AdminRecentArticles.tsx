import { formatJalali } from "@nextgen-cms/core/platform/datetime";
import type { AdminRecentArticle } from "@nextgen-cms/studio/admin/types";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  published: "منتشرشده",
  draft: "پیش‌نویس",
  archived: "بایگانی",
};

type AdminRecentArticlesProps = {
  articles: AdminRecentArticle[];
};

export function AdminRecentArticles({ articles }: AdminRecentArticlesProps) {
  if (articles.length === 0) {
    return <p className="text-sm text-ink-muted">هنوز محتوایی ثبت نشده است.</p>;
  }

  return (
    <ul className="divide-y divide-rule">
      {articles.map((article) => (
        <li
          key={article.id}
          className="flex flex-wrap items-center justify-between gap-3 py-3"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/admin/content/${article.id}/edit`}
              className="font-medium text-ink hover:text-accent"
            >
              {article.title}
            </Link>
            <p className="mt-0.5 text-xs text-ink-muted">
              {article.slug}
              {article.publishedAt || article.updatedAt ? (
                <span className="ms-2 fa-num">
                  ·{" "}
                  {formatJalali(
                    article.publishedAt ?? article.updatedAt.slice(0, 10),
                  )}
                </span>
              ) : null}
            </p>
          </div>
          <span className="rounded-full border border-rule px-2 py-0.5 text-xs text-ink-muted">
            {statusLabels[article.status] ?? article.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
