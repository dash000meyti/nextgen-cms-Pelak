"use server";

import {
  invalidateMessage,
  invalidateMessages,
} from "@nextgen-cms/config/cache";
import type { MessageStatus } from "@nextgen-cms/contract/types/messages";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  deleteMessage as deleteMessageRepo,
  findMessageByIdAdmin,
  updateMessageStatus as updateMessageStatusRepo,
} from "@nextgen-cms/core/db/repositories/messages-admin";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";

function access(memberId: number) {
  return { memberId };
}

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  throw error;
}

const VALID_STATUSES: MessageStatus[] = [
  "unread",
  "reviewed",
  "pending_followup",
];

export async function saveMessageStatus(
  id: number,
  status: MessageStatus,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("messages.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: "وضعیت نامعتبر است." };
  }

  try {
    const existing = await findMessageByIdAdmin(id, access(session.memberId));
    if (!existing) return { ok: false, error: "پیام یافت نشد." };

    await updateMessageStatusRepo(id, status, access(session.memberId));
    invalidateMessages();
    invalidateMessage(id);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function removeMessage(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("messages.delete");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  try {
    const existing = await findMessageByIdAdmin(id, access(session.memberId));
    if (!existing) return { ok: false, error: "پیام یافت نشد." };

    await deleteMessageRepo(id, access(session.memberId));
    invalidateMessages();
    invalidateMessage(id);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}
