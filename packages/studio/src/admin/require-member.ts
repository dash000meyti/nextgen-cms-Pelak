"use server";

import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import { redirect } from "next/navigation";

export async function requireMember() {
  const session = await getMemberSession();
  if (!session) redirect("/admin/login");
  return session;
}
