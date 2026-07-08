"use client";

import { restoreVideoFromArchiveAndRedirect } from "@nextgen-cms/studio/cms/mutations/video";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import { TableActionButton } from "@/components/admin/studio/TableActionButton";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { formatServerActionError } from "@/lib/format-server-action-error";

type RestoreVideoButtonProps = {
  videoId: number;
};

export function RestoreVideoButton({ videoId }: RestoreVideoButtonProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog();

  async function handleRestore() {
    const confirmed = await confirm({
      title: "بازیابی از بایگانی",
      message: "این ویدیو از بایگانی بازیابی شود؟",
      confirmLabel: "بازیابی",
      variant: "default",
    });
    if (!confirmed) return;
    setError(null);
    startTransition(() => {
      void (async () => {
        const result = await restoreVideoFromArchiveAndRedirect(videoId);
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
        label="بازیابی از بایگانی"
        icon="restore"
        onClick={handleRestore}
        disabled={pending}
      />
      {error ? <span className="text-xs text-accent">{error}</span> : null}
    </span>
  );
}
