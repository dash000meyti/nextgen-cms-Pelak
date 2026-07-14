"use client";

import { removeVideoAndRedirect } from "@nextgen-cms/studio/cms/mutations/video";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTransition } from "react";
import { TableActionButton } from "@/components/admin/studio/TableActionButton";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";
import { formatServerActionError } from "@/lib/format-server-action-error";

type DeleteArchivedVideoButtonProps = {
  videoId: number;
};

export function DeleteArchivedVideoButton({
  videoId,
}: DeleteArchivedVideoButtonProps) {
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const { confirm, dialog } = useConfirmDialog();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "حذف دائمی",
      message: "این ویدیو برای همیشه حذف شود؟",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    feedback.clear();
    startTransition(() => {
      void (async () => {
        const result = await removeVideoAndRedirect(videoId);
        if (result && !result.ok) {
          feedback.reportError(result.error, result.field);
        }
      })().catch((caught: unknown) => {
        if (isRedirectError(caught)) throw caught;
        feedback.reportError(formatServerActionError(caught));
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
      <FormMessage
        error={feedback.error}
        info={feedback.info}
        onDismiss={feedback.clear}
      />
    </span>
  );
}
