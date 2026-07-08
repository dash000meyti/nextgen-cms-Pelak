import type { VideoStatus } from "@nextgen-cms/contract/video-status";
import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";

const LABELS: Record<ArticleStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی",
};

const STYLES: Record<ArticleStatus, string> = {
  draft: "bg-surface-2 text-ink-muted",
  published: "bg-accent-soft text-accent",
  archived: "bg-surface-2 text-ink-faint",
};

export function StatusBadge({
  status,
}: {
  status: ArticleStatus | VideoStatus;
}) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
