import type { MemberSession } from "@nextgen-cms/contract/types/member";
import { db } from "@nextgen-cms/core/db";
import { getMemberPermissions } from "@nextgen-cms/core/db/repositories/permissions";
import { memberSessions, members, roles } from "@nextgen-cms/core/db/schema";
import {
  type AdminSession,
  getSessionSecret,
  SESSION_COOKIE,
  SESSION_DURATION_MS,
} from "@nextgen-cms/studio/admin/session-token";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export {
  type AdminSession,
  type MemberSession,
  SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@nextgen-cms/studio/admin/session-token";

export async function createMemberSession(
  memberId: number,
  username: string,
  email: string | null,
) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
  const createdAt = new Date().toISOString();

  await db.insert(memberSessions).values({
    memberId,
    token,
    expiresAt,
    createdAt,
  });

  const signed = await new SignJWT({
    token,
    memberId,
    username,
    email: email ?? "",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + SESSION_DURATION_MS / 1000,
    )
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

/** @deprecated Use createMemberSession */
export async function createAdminSession(userId: number, username: string) {
  await createMemberSession(userId, username, null);
}

export async function destroyMemberSession() {
  const cookieStore = await cookies();
  const signed = cookieStore.get(SESSION_COOKIE)?.value;

  if (signed) {
    try {
      const { payload } = await jwtVerify(signed, getSessionSecret());
      const token = payload.token;
      if (typeof token === "string") {
        await db.delete(memberSessions).where(eq(memberSessions.token, token));
      }
    } catch {
      // ignore invalid token on logout
    }
  }

  cookieStore.delete(SESSION_COOKIE);
}

/** @deprecated Use destroyMemberSession */
export async function destroyAdminSession() {
  await destroyMemberSession();
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const cookieStore = await cookies();
  const signed = cookieStore.get(SESSION_COOKIE)?.value;
  if (!signed) return null;

  return verifyMemberSessionInDb(signed);
}

/** @deprecated Use getMemberSession */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getMemberSession();
  if (!session) return null;
  return { userId: session.memberId, username: session.username };
}

export async function verifyMemberSessionInDb(
  signed: string,
): Promise<MemberSession | null> {
  try {
    const { payload } = await jwtVerify(signed, getSessionSecret());
    const token = payload.token;
    if (typeof token !== "string") return null;

    const rows = await db
      .select({
        memberId: members.id,
        memberUsername: members.username,
        memberEmail: members.email,
        expiresAt: memberSessions.expiresAt,
        roleId: roles.id,
        roleSlug: roles.slug,
        roleName: roles.name,
        roleIsSystem: roles.isSystem,
        roleDescription: roles.description,
      })
      .from(memberSessions)
      .innerJoin(members, eq(memberSessions.memberId, members.id))
      .innerJoin(roles, eq(members.roleId, roles.id))
      .where(eq(memberSessions.token, token))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    if (new Date(row.expiresAt).getTime() < Date.now()) return null;
    if (!row.memberUsername) return null;

    const permissions = await getMemberPermissions(row.memberId);

    return {
      memberId: row.memberId,
      username: row.memberUsername,
      email: row.memberEmail,
      role: {
        id: row.roleId,
        slug: row.roleSlug,
        name: row.roleName,
        isSystem: row.roleIsSystem,
        description: row.roleDescription,
      },
      permissions,
    };
  } catch {
    return null;
  }
}

/** @deprecated Use verifyMemberSessionInDb */
export async function verifyAdminSessionInDb(
  signed: string,
): Promise<AdminSession | null> {
  const session = await verifyMemberSessionInDb(signed);
  if (!session) return null;
  return { userId: session.memberId, username: session.username };
}
