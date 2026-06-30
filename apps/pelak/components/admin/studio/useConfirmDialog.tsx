"use client";

import { useCallback, useState } from "react";
import {
  ConfirmDialog,
  type ConfirmDialogVariant,
} from "@/components/admin/studio/ConfirmDialog";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
};

type ConfirmState = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
};

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback((confirmed: boolean) => {
    setState((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const dialog = (
    <ConfirmDialog
      open={state != null}
      title={state?.title ?? ""}
      message={state?.message ?? ""}
      confirmLabel={state?.confirmLabel}
      cancelLabel={state?.cancelLabel}
      variant={state?.variant}
      onCancel={() => handleClose(false)}
      onConfirm={() => handleClose(true)}
    />
  );

  return { confirm, dialog };
}
