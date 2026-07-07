import type {
  MessageForm,
  MessageStatus,
} from "@nextgen-cms/contract/types/messages";
import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { mapMessageRow } from "@nextgen-cms/core/db/mappers/message";
import { messages } from "@nextgen-cms/core/db/schema";
import { and, desc, eq } from "drizzle-orm";

export type MessageListFilters = {
  status?: MessageStatus;
  form?: MessageForm;
};

export async function findAllMessagesAdmin(
  access: AdminAccess,
  filters: MessageListFilters = {},
) {
  await assertMemberPermission(access.memberId, "messages.view");

  const conditions = [];
  if (filters.status) conditions.push(eq(messages.status, filters.status));
  if (filters.form) conditions.push(eq(messages.form, filters.form));

  const rows = await db
    .select()
    .from(messages)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(messages.createdAt));

  return rows.map(mapMessageRow);
}

export async function findMessageByIdAdmin(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "messages.view");

  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  const row = rows[0];
  return row ? mapMessageRow(row) : undefined;
}

export async function updateMessageStatus(
  id: number,
  status: MessageStatus,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "messages.edit");

  const existing = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.update(messages).set({ status }).where(eq(messages.id, id));
}

export async function deleteMessage(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "messages.delete");

  const existing = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.delete(messages).where(eq(messages.id, id));
}
