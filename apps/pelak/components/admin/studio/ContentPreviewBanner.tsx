import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import Link from "next/link";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";

type ContentPreviewBannerProps = {
  articleId: number;
  status: ArticleStatus;
};

export function ContentPreviewBanner({
  articleId,
  status,
}: ContentPreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-rule bg-surface-2 px-4 py-3">
      <div className="mx-auto flex max-w-wide flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-ink">
            پیش‌نمایش — این محتوا در سایت عمومی نمایش داده نمی‌شود
          </span>
          <StatusBadge status={status} />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/admin/content/${articleId}/edit`}
            className="text-accent hover:underline"
          >
            بازگشت به ویرایش
          </Link>
          <Link
            href="/admin/content"
            className="text-ink-muted hover:text-accent"
          >
            فهرست محتوا
          </Link>
        </div>
      </div>
    </div>
  );
}
