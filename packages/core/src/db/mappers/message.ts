import type {
  Message,
  MessageForm,
  MessagePayload,
  MessageStatus,
} from "@nextgen-cms/contract/types/messages";
import type { MessageRow } from "@nextgen-cms/core/db/schema/messages";

const MESSAGE_STATUSES: MessageStatus[] = [
  "unread",
  "reviewed",
  "pending_followup",
];

function normalizeStatus(value: string): MessageStatus {
  return (MESSAGE_STATUSES as readonly string[]).includes(value)
    ? (value as MessageStatus)
    : "unread";
}

function parsePayload(value: MessageRow["payload"]): MessagePayload {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as MessagePayload;
      }
    } catch {
      return {};
    }
  }
  if (value && typeof value === "object") {
    return value as MessagePayload;
  }
  return {};
}

export function mapMessageRow(row: MessageRow): Message {
  return {
    id: row.id,
    form: row.form as MessageForm,
    status: normalizeStatus(row.status),
    payload: parsePayload(row.payload),
    createdAt: row.createdAt,
  };
}
