"use client";

import { useEffect } from "react";

const DISMISS_MS = 10_000;

type FormMessageProps = {
  error?: string | null;
  success?: string | null;
  /** Neutral / gray notice. */
  info?: string | null;
  /** Called when the user clicks X or the auto-dismiss timer fires. */
  onDismiss?: () => void;
};

type ToastVariant = "error" | "success" | "info";

function resolveToast(
  error?: string | null,
  success?: string | null,
  info?: string | null,
): { message: string; variant: ToastVariant } | null {
  if (error) return { message: error, variant: "error" };
  if (success) return { message: success, variant: "success" };
  if (info) return { message: info, variant: "info" };
  return null;
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  error: "bg-[var(--toast-error-soft)] text-[var(--toast-error)]",
  success: "bg-[var(--toast-ok-soft)] text-[var(--toast-ok)]",
  info: "bg-[var(--toast-info-soft)] text-[var(--toast-info)]",
};

export function FormMessage({
  error,
  success,
  info,
  onDismiss,
}: FormMessageProps) {
  const toast = resolveToast(error, success, info);

  const message = toast?.message ?? null;

  useEffect(() => {
    if (!message || !onDismiss) return;
    const id = window.setTimeout(() => {
      onDismiss();
    }, DISMISS_MS);
    return () => window.clearTimeout(id);
  }, [message, onDismiss]);

  if (!toast) return null;

  const isError = toast.variant === "error";

  return (
    <div
      data-form-message=""
      data-toast-variant={toast.variant}
      className={[
        "fixed top-[15%] left-1/2 z-50 w-[min(100%-2rem,24rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-lg text-sm shadow-md",
        VARIANT_CLASS[toast.variant],
      ].join(" ")}
      role={isError ? "alert" : "status"}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <p className="min-w-0 flex-1 leading-relaxed">{toast.message}</p>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="بستن"
            className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              aria-hidden="true"
              className="block"
            >
              <path
                fill="currentColor"
                d="M3.2 3.2a.75.75 0 0 1 1.06 0L8 6.94l3.74-3.74a.75.75 0 1 1 1.06 1.06L9.06 8l3.74 3.74a.75.75 0 1 1-1.06 1.06L8 9.06l-3.74 3.74a.75.75 0 0 1-1.06-1.06L6.94 8 3.2 4.26a.75.75 0 0 1 0-1.06Z"
              />
            </svg>
          </button>
        ) : null}
      </div>
      {onDismiss ? (
        <div className="h-1 bg-current/10" aria-hidden="true">
          <div
            key={message}
            className="form-toast-progress h-full bg-current/55"
            style={{ animationDuration: `${DISMISS_MS}ms` }}
          />
        </div>
      ) : null}
    </div>
  );
}
