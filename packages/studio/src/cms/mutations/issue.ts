"use server";

import { invalidateIssue, invalidateIssues } from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  findIssueById,
  type IssueWriteInput,
  insertIssue,
  issueNumberExistsAdmin,
  updateIssue,
} from "@nextgen-cms/core/db/repositories/issues-admin";
import { parseJalaliInput } from "@nextgen-cms/core/platform/datetime";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import {
  validateImageMeta,
  validateRequired,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type IssueFormData = {
  number: number;
  season: string;
  year: number;
  label: string;
  coverSrc: string;
  coverAlt: string;
  publishedAt: string;
};

function access(memberId: number) {
  return { memberId };
}

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  throw error;
}

function parseFormData(data: IssueFormData): IssueWriteInput {
  let publishedAt = data.publishedAt.trim();
  try {
    publishedAt = parseJalaliInput(publishedAt);
  } catch {
    // keep as-is if already ISO
  }

  return {
    number: data.number,
    season: data.season.trim(),
    year: data.year,
    label: data.label.trim(),
    coverSrc: data.coverSrc.trim(),
    coverAlt: data.coverAlt.trim(),
    publishedAt,
  };
}

async function validate(input: IssueWriteInput, excludeId?: number) {
  if (!input.number || input.number < 1) return "شمارهٔ شماره نامعتبر است.";
  const labelError = validateRequired(input.label, "برچسب");
  if (labelError) return labelError;
  const coverError = validateImageMeta(input.coverSrc, input.coverAlt, "جلد");
  if (coverError) return coverError;
  const exists = await issueNumberExistsAdmin(input.number, excludeId);
  if (exists) return "این شماره قبلاً استفاده شده است.";
  return undefined;
}

export async function createIssue(
  data: IssueFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.issues.create",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = parseFormData(data);
  const error = await validate(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertIssue(input, access(session.memberId));
    invalidateIssues();
    invalidateIssue(input.number);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveIssue(
  id: number,
  data: IssueFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.issues.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findIssueById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "شماره یافت نشد." };

  const input = parseFormData(data);
  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    await updateIssue(id, input, access(session.memberId));
    invalidateIssues();
    invalidateIssue(input.number);
    if (existing.number !== input.number) invalidateIssue(existing.number);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createIssueAndRedirect(data: IssueFormData) {
  const result = await createIssue(data);
  if (!result.ok) return result;
  redirect(`/admin/issues/${result.id}/edit`);
}
