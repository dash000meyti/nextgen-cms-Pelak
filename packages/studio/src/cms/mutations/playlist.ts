"use server";

import {
  invalidatePlaylist,
  invalidatePlaylists,
  invalidateVideos,
} from "@nextgen-cms/config/cache";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  deletePlaylist as deletePlaylistRepo,
  findPlaylistById,
  insertPlaylist,
  type PlaylistWriteInput,
  updatePlaylist,
} from "@nextgen-cms/core/db/repositories/playlists-admin";
import { playlistPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import type { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";
import { assertUniqueSlug } from "@nextgen-cms/studio/cms/queries/slug";
import {
  validateImageMeta,
  validateRequired,
  validateSlug,
} from "@nextgen-cms/studio/cms/validation";
import { redirect } from "next/navigation";

export type PlaylistFormData = {
  slug: string;
  name: string;
  description: string;
  coverSrc: string;
  coverAlt: string;
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

function parseFormData(data: PlaylistFormData): PlaylistWriteInput {
  return {
    slug: data.slug.trim(),
    name: data.name.trim(),
    description: data.description.trim(),
    coverSrc: data.coverSrc.trim(),
    coverAlt: data.coverAlt.trim(),
  };
}

async function validate(input: PlaylistWriteInput, excludeId?: number) {
  const nameError = validateRequired(input.name, "نام");
  if (nameError) return nameError;
  const slugError = validateSlug(input.slug);
  if (slugError) return slugError;
  const uniqueError = await assertUniqueSlug("playlist", input.slug, excludeId);
  if (uniqueError) return uniqueError;
  return validateImageMeta(input.coverSrc, input.coverAlt, "کاور لیست پخش");
}

async function resolvePlaylistCoverSrc(
  playlistId: number,
  coverSrc: string,
): Promise<string> {
  if (!coverSrc.trim()) return coverSrc;
  return promoteMediaToFolder(coverSrc, playlistPath(playlistId));
}

export async function createPlaylist(
  data: PlaylistFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const input = parseFormData(data);
  const error = await validate(input);
  if (error) return { ok: false, error };
  try {
    const id = await insertPlaylist(input, access(session.memberId));
    const coverSrc = await resolvePlaylistCoverSrc(id, input.coverSrc);
    if (coverSrc !== input.coverSrc) {
      await updatePlaylist(
        id,
        { ...input, coverSrc },
        access(session.memberId),
      );
    }
    invalidatePlaylists();
    invalidatePlaylist(input.slug);
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function savePlaylist(
  id: number,
  data: PlaylistFormData,
): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findPlaylistById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "لیست پخش یافت نشد." };
  const input = parseFormData(data);
  const error = await validate(input, id);
  if (error) return { ok: false, error };
  try {
    const coverSrc = await resolvePlaylistCoverSrc(id, input.coverSrc);
    await updatePlaylist(id, { ...input, coverSrc }, access(session.memberId));
    invalidatePlaylists();
    invalidatePlaylist(input.slug);
    if (existing.slug !== input.slug) invalidatePlaylist(existing.slug);
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function deletePlaylist(id: number): Promise<MutationResult> {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.video.delete",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;
  const session = sessionOrDenied as Awaited<ReturnType<typeof requireMember>>;
  const existing = await findPlaylistById(id, access(session.memberId));
  if (!existing) return { ok: false, error: "لیست پخش یافت نشد." };
  try {
    await deletePlaylistRepo(id, access(session.memberId));
    invalidatePlaylists();
    invalidatePlaylist(existing.slug);
    invalidateVideos();
    return { ok: true, id };
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function createPlaylistAndRedirect(data: PlaylistFormData) {
  const result = await createPlaylist(data);
  if (!result.ok) return result;
  redirect(`/admin/videos/playlists/${result.id}/edit`);
}
