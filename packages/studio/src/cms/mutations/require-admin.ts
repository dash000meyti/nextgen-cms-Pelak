"use server";

import { requireMember } from "@nextgen-cms/studio/admin/require-member";

export async function requireAdmin() {
  const session = await requireMember();
  return {
    userId: session.memberId,
    username: session.username,
  };
}

export type { MutationResult } from "@nextgen-cms/studio/cms/mutations/mutation-result";
