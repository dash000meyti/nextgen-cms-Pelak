"use client";

import { removeArticleAndRedirect } from "@nextgen-cms/studio/cms/mutations/article";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { formatServerActionError } from "@/lib/format-server-action-error";

type DeleteArchivedArticleButtonProps = {
  articleId: number;
};

export function DeleteArchivedArticleButton({
  articleId,
}: DeleteArchivedArticleButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm("این محتوا برای همیشه حذف شود؟")) return;
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await removeArticleAndRedirect(articleId);
        if (result && !result.ok) setError(result.error);
      })().catch((caught: unknown) => {
        if (isRedirectError(caught)) throw caught;
        setError(formatServerActionError(caught));
      });
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="text-ink-muted hover:text-accent disabled:opacity-50"
      >
        {pending ? "در حال حذف…" : "حذف دائمی"}
      </button>
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </span>
  );
}
