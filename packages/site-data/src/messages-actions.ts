"use server";

import type {
  MessageForm,
  MessagePayload,
} from "@nextgen-cms/contract/types/messages";
import { insertMessage } from "@nextgen-cms/core/db/repositories/messages";
import type {
  SubmitMessageInput,
  SubmitMessageResult,
} from "@nextgen-cms/site-data/messages";

const MAX_FIELD_LENGTH = 5000;
const MAX_MESSAGE_LENGTH = 20000;

const REQUIRED_FIELDS: Record<string, string[]> = {
  contact: ["message"],
  survey: ["comment"],
};

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validatePayload(
  form: MessageForm,
  payload: MessagePayload,
): string | null {
  const required = REQUIRED_FIELDS[form] ?? [];
  for (const key of required) {
    const value = trimString(payload[key]);
    if (!value) return "لطفاً تمام فیلدهای ضروری را پر کنید.";
  }

  for (const [key, value] of Object.entries(payload)) {
    if (typeof value !== "string" && value !== undefined) {
      return "ورودی نامعتبر است.";
    }
    const trimmed = trimString(value);
    const limit =
      key === "message" || key === "comment"
        ? MAX_MESSAGE_LENGTH
        : MAX_FIELD_LENGTH;
    if (trimmed.length > limit) {
      return "یکی از فیلدها بیش از حد طولانی است.";
    }
  }

  return null;
}

/**
 * Public write path for form submissions. Validates input, then persists via
 * the core repository. No RBAC — intended for anonymous site visitors.
 */
export async function submitMessage(
  input: SubmitMessageInput,
): Promise<SubmitMessageResult> {
  const form = input.form;
  if (typeof form !== "string" || form.trim().length === 0) {
    return { ok: false, error: "نوع فرم نامعتبر است." };
  }

  if (trimString(input.website) !== "") {
    // Honeypot triggered — silently drop but report success to bots.
    return { ok: true };
  }

  const payload: MessagePayload = {};
  for (const [key, value] of Object.entries(input.payload ?? {})) {
    payload[key] = trimString(value) || undefined;
  }

  const error = validatePayload(form, payload);
  if (error) return { ok: false, error };

  try {
    await insertMessage({ form, payload });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "ارسال پیام ناموفق بود. لطفاً دوباره تلاش کنید.",
    };
  }
}
