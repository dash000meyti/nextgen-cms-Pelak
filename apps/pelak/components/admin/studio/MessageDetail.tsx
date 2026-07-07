"use client";

import type {
  Message,
  MessageStatus,
} from "@nextgen-cms/contract/types/messages";
import {
  removeMessage,
  saveMessageStatus,
} from "@nextgen-cms/studio/cms/mutations/message";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { FormMessage } from "@/components/admin/studio/FormMessage";
import {
  MESSAGE_STATUS_OPTIONS,
  MessageStatusBadge,
} from "@/components/admin/studio/MessageStatusBadge";
import { useConfirmDialog } from "@/components/admin/studio/useConfirmDialog";

const FIELD_LABELS: Record<string, string> = {
  name: "نام",
  email: "ایمیل",
  phone: "شماره موبایل",
  subject: "موضوع",
  message: "پیام",
  comment: "متن نظر",
};

const FORM_LABELS: Record<string, string> = {
  contact: "تماس با ما",
  survey: "نظرسنجی",
};

function StatusIcon({
  name,
  label,
}: {
  name: MessageStatus;
  label: string;
}): ReactNode {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "unread") {
    return (
      <svg {...common}>
        <title>{label}</title>
        <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (name === "reviewed") {
    return (
      <svg {...common}>
        <title>{label}</title>
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <title>{label}</title>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

type MessageDetailProps = {
  message: Message;
  canEdit: boolean;
  canDelete: boolean;
};

export function MessageDetail({
  message,
  canEdit,
  canDelete,
}: MessageDetailProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<MessageStatus>(message.status);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { confirm, dialog } = useConfirmDialog();

  const entries = Object.entries(message.payload).filter(
    ([, value]) => value !== undefined && value !== "",
  );

  function handleStatusChange(next: MessageStatus) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await saveMessageStatus(message.id, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus(next);
      setSuccess("وضعیت به‌روز شد.");
      router.refresh();
    });
  }

  async function handleDelete() {
    const confirmed = await confirm({
      title: "حذف پیام",
      message: "این پیام حذف شود؟ این عمل قابل بازگشت نیست.",
      confirmLabel: "حذف",
    });
    if (!confirmed) return;
    startTransition(async () => {
      const result = await removeMessage(message.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/messages");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {dialog}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl text-ink">
            {FORM_LABELS[message.form] ?? message.form}
          </h1>
          <p className="mt-1 text-sm text-ink-muted" dir="ltr">
            {new Date(message.createdAt).toLocaleString("fa-IR")}
          </p>
        </div>
        <MessageStatusBadge status={status} />
      </div>

      <FormMessage error={error} success={success} />

      {canEdit ? (
        <div className="space-y-2 text-sm">
          <span className="block font-medium text-ink">وضعیت</span>
          <div className="flex flex-wrap gap-2">
            {MESSAGE_STATUS_OPTIONS.map((option) => {
              const active = status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  disabled={pending}
                  onClick={() => handleStatusChange(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-50 ${
                    active
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-rule text-ink-muted hover:border-accent/40 hover:text-ink"
                  }`}
                >
                  <StatusIcon name={option.value} label={option.label} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded border border-rule bg-surface">
        <dl className="divide-y divide-rule">
          {entries.length === 0 ? (
            <div className="px-5 py-6 text-sm text-ink-muted">
              محتوایی برای نمایش نیست.
            </div>
          ) : (
            entries.map(([key, value]) => (
              <div
                key={key}
                className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr] sm:gap-4"
              >
                <dt className="text-sm font-medium text-ink-muted">
                  {FIELD_LABELS[key] ?? key}
                </dt>
                <dd
                  className="whitespace-pre-wrap wrap-break-word text-sm text-ink"
                  dir={key === "email" || key === "phone" ? "ltr" : undefined}
                >
                  {value}
                </dd>
              </div>
            ))
          )}
        </dl>
      </div>

      {canDelete ? (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="rounded border border-rule px-6 py-2 text-sm text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
        >
          حذف پیام
        </button>
      ) : null}
    </div>
  );
}
