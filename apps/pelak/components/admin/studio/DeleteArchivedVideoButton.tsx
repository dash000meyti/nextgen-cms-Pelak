"use client";

import { removeVideoAndRedirect } from "@nextgen-cms/studio/cms/mutations/video";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { TableActionButton } from "@/components/admin/studio/TableActionButton";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { formatServerActionError } from "@/lib/format-server-action-error";

type DeleteArchivedVideoButtonProps = {
  videoId: number;
};

export function DeleteArchivedVideoButton({
  videoId,
}: DeleteArchivedVideoButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "حذف دائمی",
      message: "این ویدیو برای همیشه حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await removeVideoAndRedirect(videoId);
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
      <TableActionButton
        label="حذف دائمی"
        icon="delete"
        onClick={handleDelete}
        disabled={pending}
      />
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </span>
  );
}
