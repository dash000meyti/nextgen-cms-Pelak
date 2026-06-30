"use client";

import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { StatusBadge } from "@/components/admin/studio/StatusBadge";

type PublishBarProps = {
  status: ArticleStatus;
  canPublish: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  publishing?: boolean;
};

export function PublishBar({
  status,
  canPublish,
  onPublish,
  onUnpublish,
  publishing = false,
}: PublishBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded border border-rule bg-surface-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">وضعیت:</span>
        <StatusBadge status={status} />
      </div>
      {canPublish && status !== "archived" ? (
        <div className="flex gap-2">
          {status === "published" ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={publishing}
              className="rounded border border-rule px-4 py-2 text-sm text-ink hover:bg-surface disabled:opacity-50"
            >
              لغو انتشار
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={publishing}
              className="rounded bg-accent px-4 py-2 text-sm text-paper hover:bg-accent-hover disabled:opacity-50"
            >
              انتشار
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}
