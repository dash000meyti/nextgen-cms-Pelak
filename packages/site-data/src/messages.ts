import { platformCache } from "@nextgen-cms/config/cache";
import { CACHE_TAGS } from "@nextgen-cms/config/constants";
import type {
  MessageForm,
  MessagePayload,
} from "@nextgen-cms/contract/types/messages";
import { findMessagesSettings } from "@nextgen-cms/core/db/repositories/site-config";

export type SubmitMessageResult = { ok: true } | { ok: false; error: string };

export type SubmitMessageInput = {
  form: MessageForm;
  payload: MessagePayload;
  /** Honeypot field — must be empty for a human submission */
  website?: string;
};

export const getMessagesSettings = platformCache(
  ["messages-settings"],
  [CACHE_TAGS.siteConfig],
  findMessagesSettings,
);
