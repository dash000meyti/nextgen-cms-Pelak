"use client";

import { restoreArticleFromArchiveAndRedirect } from "@nextgen-cms/studio/cms/mutations/article";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { formatServerActionError } from "@/lib/format-server-action-error";

type RestoreArticleButtonProps = {
  articleId: number;
};

export function RestoreArticleButton({ articleId }: RestoreArticleButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog();

  async function handleRestore() {
    const confirmed = await confirm({
      title: "بازیابی از بایگانی",
      message: "این محتوا از بایگانی بازیابی شود؟",
      confirmLabel: "بازیابی",
      variant: "default",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await restoreArticleFromArchiveAndRedirect(articleId);
        if (result && !result.ok) setError(result.error);
      })().catch((caught: unknown) => {
        if (isRedirectError(caught)) throw caught;
        setError(formatServerActionError(caught));
      });
    });
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      {dialog}
      <button
        type="button"
        onClick={handleRestore}
        disabled={pending}
        className="text-accent hover:underline disabled:opacity-50"
      >
        {pending ? "در حال بازیابی…" : "بازیابی از بایگانی"}
      </button>
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </span>
  );
}
