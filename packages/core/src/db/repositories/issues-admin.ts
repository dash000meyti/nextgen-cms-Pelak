import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { issues } from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

export type IssueWriteInput = {
  number: number;
  season: string;
  year: number;
  label: string;
  coverSrc: string;
  coverAlt: string;
  publishedAt: string;
};

export async function findIssueById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(access.memberId, "modules.issues.view");
    } catch {
      return undefined;
    }
  }

  const rows = await db.select().from(issues).where(eq(issues.id, id)).limit(1);
  return rows[0];
}

export async function findAllIssuesAdmin(access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.issues.view");
  return db.select().from(issues).orderBy(issues.number);
}

export async function issueNumberExistsAdmin(
  number: number,
  excludeId?: number,
) {
  const where =
    excludeId != null
      ? and(eq(issues.number, number), ne(issues.id, excludeId))
      : eq(issues.number, number);
  const rows = await db
    .select({ id: issues.id })
    .from(issues)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertIssue(input: IssueWriteInput, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.issues.create");

  const result = await db
    .insert(issues)
    .values({
      number: input.number,
      season: input.season,
      year: input.year,
      label: input.label,
      coverSrc: input.coverSrc,
      coverAlt: input.coverAlt,
      publishedAt: input.publishedAt,
    })
    .returning({ id: issues.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert issue");
  return id;
}

export async function updateIssue(
  id: number,
  input: IssueWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.issues.edit");

  const existing = await db
    .select({ id: issues.id })
    .from(issues)
    .where(eq(issues.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db
    .update(issues)
    .set({
      number: input.number,
      season: input.season,
      year: input.year,
      label: input.label,
      coverSrc: input.coverSrc,
      coverAlt: input.coverAlt,
      publishedAt: input.publishedAt,
    })
    .where(eq(issues.id, id));
}

export async function deleteIssue(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.issues.delete");

  const existing = await db
    .select({ id: issues.id })
    .from(issues)
    .where(eq(issues.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.delete(issues).where(eq(issues.id, id));
}
