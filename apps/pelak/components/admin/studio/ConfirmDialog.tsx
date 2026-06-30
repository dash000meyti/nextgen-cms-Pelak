"use client";

import { useEffect, useRef } from "react";

export type ConfirmDialogVariant = "destructive" | "default";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأیید",
  cancelLabel = "انصراف",
  variant = "destructive",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    confirmButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel, pending]);

  if (!open) return null;

  const confirmClasses =
    variant === "destructive"
      ? "border-accent bg-accent text-paper hover:bg-accent-hover"
      : "border-accent text-accent hover:bg-accent-soft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="بستن"
        onClick={pending ? undefined : onCancel}
        disabled={pending}
      />
      <div
        className="relative w-full max-w-md rounded border border-rule bg-paper p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <h3 id="confirm-dialog-title" className="font-heading text-lg text-ink">
          {title}
        </h3>
        <p id="confirm-dialog-message" className="mt-3 text-sm text-ink-muted">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded border border-rule px-4 py-2 text-sm text-ink-muted hover:border-accent/30 hover:text-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded border px-4 py-2 text-sm disabled:opacity-50 ${confirmClasses}`}
          >
            {pending ? "در حال انجام…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
