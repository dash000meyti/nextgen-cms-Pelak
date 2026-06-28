"use server";

import { requireMember } from "@nextgen-cms/studio/admin/require-member";

export async function requireAdmin() {
  const session = await requireMember();
  return {
    userId: session.memberId,
    email: session.email ?? "",
  };
}

export type MutationResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };
