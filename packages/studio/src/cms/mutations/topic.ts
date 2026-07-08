"use server";

import { invalidateTopic, invalidateTopics } from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  deleteTopic as deleteTopicRepo,
  findTopicById,
  insertTopic,
  type TopicWriteInput,
  updateTopic,
  updateTopicShowOnHomepage as updateTopicShowOnHomepageRepo,
} from "@nextgen-cms/core/db/repositories/topics-admin";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  normalizeSlugInput,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type TopicFormData = {
  slug: string;
  name: string;
  description: string;
  showOnHomepage: boolean;
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

function parseFormData(data: TopicFormData): TopicWriteInput {
  return {
    slug: normalizeSlugInput(data.slug),
    name: data.name.trim(),
    description: data.description.trim(),
    showOnHomepage: data.showOnHomepage,
  };
}

async function validate(input: TopicWriteInput, excludeId?: number) {
  const nameError = validateRequired(input.name, "نام");
  if (nameError) return nameError;
  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;
  return assertUniqueSlug("topic", input.slug, excludeId);
}

export async function createTopic(
  data: TopicFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const input = parseFormData(data);
  const error = await validate(input);
  if (error) return { ok: false, error };

  try {
    const id = await insertTopic(input, access(session.memberId));
    invalidateTopics();
    invalidateTopic(input.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveTopic(
  id: number,
  data: TopicFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findTopicById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "موضوع یافت نشد." };

  const input = parseFormData(data);
  const error = await validate(input, id);
  if (error) return { ok: false, error };

  try {
    await updateTopic(id, input, access(session.memberId));
    invalidateTopics();
    invalidateTopic(input.slug);
    if (existing.slug !== input.slug) invalidateTopic(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function deleteTopic(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findTopicById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "موضوع یافت نشد." };

  try {
    await deleteTopicRepo(id, access(session.memberId));
    invalidateTopics();
    invalidateTopic(existing.slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function setTopicShowOnHomepage(
  id: number,
  showOnHomepage: boolean,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;

  const existing = await findTopicById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "موضوع یافت نشد." };

  try {
    const slug = await updateTopicShowOnHomepageRepo(
      id,
      showOnHomepage,
      access(session.memberId),
    );
    invalidateTopics();
    invalidateTopic(slug);
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createTopicAndRedirect(data: TopicFormData) {
  const result = await createTopic(data);
  if (!result.ok) return result;
  redirect(`/admin/content/topics/${result.id}/edit`);
}
