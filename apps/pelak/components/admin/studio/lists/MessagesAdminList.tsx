"use client";

import type {
  MessageForm,
  MessageStatus,
} from "@nextgen-cms/contract/types/messages";
import Link from "next/link";
import { DocumentList } from "@/components/admin/studio/DocumentList";
import { idColumn } from "@/components/admin/studio/document-list-columns";
import { MessageStatusBadge } from "@/components/admin/studio/MessageStatusBadge";

export type MessagesAdminListRow = {
  id: number;
  form: MessageForm;
  status: MessageStatus;
  summary: string;
  createdAt: string;
};

const FORM_LABELS: Record<string, string> = {
  contact: "تماس",
  survey: "نظرسنجی",
};

const STATUS_OPTIONS: { value: MessageStatus | "all"; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "unread", label: "خوانده‌نشده" },
  { value: "reviewed", label: "بررسی‌شده" },
  { value: "pending_followup", label: "در انتظار پیگیری" },
];

const FORM_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "همهٔ فرم‌ها" },
  { value: "contact", label: "تماس" },
  { value: "survey", label: "نظرسنجی" },
];

function buildHref(status: string, form: string) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (form !== "all") params.set("form", form);
  const query = params.toString();
  return query ? `/admin/messages?${query}` : "/admin/messages";
}

type MessagesAdminListProps = {
  messages: MessagesAdminListRow[];
  status: MessageStatus | "all";
  form: string;
};

export function MessagesAdminList({
  messages,
  status,
  form,
}: MessagesAdminListProps) {
  return (
    <DocumentList
      title="پیام‌ها"
      rows={messages}
      rowKey={(row) => row.id}
      defaultSort={{ key: "created", direction: "desc" }}
      editHref={(row) => `/admin/messages/${row.id}`}
      searchPlaceholder="جستجو در خلاصهٔ پیام…"
      toolbar={
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref(option.value, form)}
              className={`rounded px-3 py-1.5 text-xs ${
                status === option.value
                  ? "bg-accent-soft text-accent"
                  : "border border-rule text-ink-muted hover:text-ink"
              }`}
            >
              {option.label}
            </Link>
          ))}
          <span className="mx-1 text-ink-faint">·</span>
          {FORM_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref(status, option.value)}
              className={`rounded px-3 py-1.5 text-xs ${
                form === option.value
                  ? "bg-accent-soft text-accent"
                  : "border border-rule text-ink-muted hover:text-ink"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      }
      columns={[
        idColumn<MessagesAdminListRow>(),
        {
          key: "summary",
          header: "خلاصه",
          sortable: true,
          sortValue: (row) => row.summary,
          searchText: (row) => row.summary,
          render: (row) => (
            <div className="min-w-0">
              <p className="font-medium">{row.summary}</p>
            </div>
          ),
        },
        {
          key: "form",
          header: "فرم",
          sortable: true,
          sortValue: (row) => row.form,
          searchText: (row) => row.form,
          render: (row) => FORM_LABELS[row.form] ?? row.form,
        },
        {
          key: "status",
          header: "وضعیت",
          sortable: true,
          sortValue: (row) => row.status,
          render: (row) => <MessageStatusBadge status={row.status} />,
        },
        {
          key: "created",
          header: "تاریخ",
          sortable: true,
          sortValue: (row) => new Date(row.createdAt),
          render: (row) =>
            new Date(row.createdAt).toLocaleDateString("fa-IR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
        },
      ]}
    />
  );
}
