"use client";

import { restoreArticleFromArchiveAndRedirect } from "@nextgen-cms/studio/cms/mutations/article";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTransition } from "react";
import { TableActionButton } from "@/components/admin/studio/TableActionButton";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";
import { FormMessage } from "@/components/ui/FormMessage";
import { useFormFeedback } from "@/components/ui/useFormFeedback";
import { formatServerActionError } from "@/lib/format-server-action-error";

type RestoreArticleButtonProps = {
  articleId: number;
};

export function RestoreArticleButton({ articleId }: RestoreArticleButtonProps) {
  const [pending, startTransition] = useTransition();
  const feedback = useFormFeedback();
  const { confirm, dialog } = useConfirmDialog();

  async function handleRestore() {
    const confirmed = await confirm({
      title: "بازیابی از بایگانی",
      message: "این محتوا از بایگانی بازیابی شود؟",
      confirmLabel: "بازیابی",
      variant: "default",
    });
    if (!confirmed) return;
    feedback.clear();
    startTransition(() => {
      void (async () => {
        const result = await restoreArticleFromArchiveAndRedirect(articleId);
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
        label="بازیابی از بایگانی"
        icon="restore"
        onClick={handleRestore}
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
