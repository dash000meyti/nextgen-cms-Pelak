import type {
  MessageForm,
  MessagePayload,
} from "@nextgen-cms/contract/types/messages";
import { db } from "@nextgen-cms/core/db";
import { messages } from "@nextgen-cms/core/db/schema";

export type InsertMessageInput = {
  form: MessageForm;
  payload: MessagePayload;
};

/** better-sqlite3 bind fails on nested JSON objects — store as string */
function jsonColumn<T>(value: T): T {
  return JSON.stringify(value) as T;
}

/**
 * Persist a public form submission. No RBAC — this is the write path used by
 * the public site via `@nextgen-cms/site-data`. Validation runs in site-data.
 */
export async function insertMessage(
  input: InsertMessageInput,
): Promise<number> {
  const result = await db
    .insert(messages)
    .values({
      form: input.form,
      status: "unread",
      payload: jsonColumn(input.payload),
      createdAt: new Date().toISOString(),
    })
    .returning({ id: messages.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert message");
  return id;
}
