import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { jwtVerify } from "jose";

export const SESSION_COOKIE = "hokmran_admin_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function getSessionSecret() {
  const secret =
    process.env.SESSION_SECRET ?? "dev-only-change-in-production-secret";
  return new TextEncoder().encode(secret);
}

/** @deprecated Use MemberSession — kept for proxy and legacy callers */
export type AdminSession = {
  userId: number;
  email: string;
};

export type { MemberSession };

/** JWT verify only, no DB. Use in proxy (network boundary). */
export async function verifyAdminSessionToken(
  signed: string,
): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(signed, getSessionSecret());
    const memberId = payload.memberId ?? payload.userId;
    const email = payload.email;

    if (typeof memberId !== "number" || typeof email !== "string") {
      return null;
    }

    return { userId: memberId, email };
  } catch {
    return null;
  }
}
