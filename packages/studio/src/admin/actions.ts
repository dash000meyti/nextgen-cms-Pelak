"use server";

import { findMemberAuthByUsername } from "@nextgen-cms/core/db/repositories/members";
import {
  createMemberSession,
  destroyMemberSession,
} from "@nextgen-cms/studio/admin/session";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
};

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!username || !password) {
    return { error: "نام کاربری و رمز عبور الزامی است." };
  }

  const member = await findMemberAuthByUsername(username);
  if (!member || !member.passwordHash || !member.isActive) {
    return { error: "نام کاربری یا رمز عبور نادرست است." };
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    return { error: "نام کاربری یا رمز عبور نادرست است." };
  }

  await createMemberSession(member.id, member.username, member.email);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAdmin() {
  await destroyMemberSession();
  redirect("/admin/login");
}
