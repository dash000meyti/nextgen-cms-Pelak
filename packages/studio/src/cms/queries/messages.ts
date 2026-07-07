import type { Message } from "@nextgen-cms/contract/types/messages";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  findAllMessagesAdmin,
  findMessageByIdAdmin,
  type MessageListFilters,
} from "@nextgen-cms/core/db/repositories/messages-admin";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { forbidden } from "next/navigation";

function access(memberId: number) {
  return { memberId };
}

async function withMemberAccess<T>(
  fn: (memberId: number) => Promise<T>,
): Promise<T> {
  const session = await requireMember();
  try {
    return await fn(session.memberId);
  } catch (error) {
    if (error instanceof PermissionDeniedError) {
      forbidden();
    }
    throw error;
  }
}

function buildSummary(message: Message): string {
  const p = message.payload;
  const subject = p.subject?.trim();
  if (subject) return subject;
  const name = p.name?.trim();
  if (name) return name;
  const email = p.email?.trim();
  if (email) return email;
  const phone = p.phone?.trim();
  if (phone) return phone;
  const body = (p.message ?? p.comment ?? "").trim();
  if (body) return body.length > 60 ? `${body.slice(0, 60)}…` : body;
  return "(بدون عنوان)";
}

export async function listMessagesAdmin(filters: MessageListFilters = {}) {
  const messages = await withMemberAccess((memberId) =>
    findAllMessagesAdmin(access(memberId), filters),
  );
  return messages.map((message) => ({
    id: message.id,
    form: message.form,
    status: message.status,
    summary: buildSummary(message),
    createdAt: message.createdAt,
  }));
}

export async function getMessageForAdmin(id: number) {
  return withMemberAccess((memberId) =>
    findMessageByIdAdmin(id, access(memberId)),
  );
}
