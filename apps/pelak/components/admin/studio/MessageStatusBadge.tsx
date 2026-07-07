import type { MessageStatus } from "@nextgen-cms/contract/types/messages";

const LABELS: Record<MessageStatus, string> = {
  unread: "خوانده‌نشده",
  reviewed: "بررسی‌شده",
  pending_followup: "در انتظار پیگیری",
};

const STYLES: Record<MessageStatus, string> = {
  unread: "bg-accent-soft text-accent",
  reviewed: "bg-surface-2 text-ink-muted",
  pending_followup: "bg-surface-2 text-ink",
};

export function MessageStatusBadge({ status }: { status: MessageStatus }) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}

export const MESSAGE_STATUS_LABELS = LABELS;

export const MESSAGE_STATUS_OPTIONS: { value: MessageStatus; label: string }[] =
  [
    { value: "unread", label: LABELS.unread },
    { value: "reviewed", label: LABELS.reviewed },
    { value: "pending_followup", label: LABELS.pending_followup },
  ];
