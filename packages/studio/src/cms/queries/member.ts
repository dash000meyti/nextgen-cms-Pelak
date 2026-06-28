import type { Member } from "@nextgen-cms/contract/types/member";
import { findMemberById } from "@nextgen-cms/core/db/repositories/members";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";

export async function getCurrentMemberProfile(): Promise<Member | null> {
  const session = await requireMember();
  return findMemberById(session.memberId);
}
