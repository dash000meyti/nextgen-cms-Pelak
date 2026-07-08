import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { playlists } from "@nextgen-cms/core/db/schema";
import { playlistPath } from "@nextgen-cms/core/media/path-policy";
import { purgeMediaFolder } from "@nextgen-cms/core/media/purge-folder";
import { and, eq, ne } from "drizzle-orm";

export type PlaylistWriteInput = {
  slug: string;
  name: string;
  description: string;
  coverSrc: string;
  coverAlt: string;
};

export async function findPlaylistById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(access.memberId, "modules.video.view");
    } catch {
      return undefined;
    }
  }
  const rows = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, id))
    .limit(1);
  return rows[0];
}

export async function findAllPlaylistsAdmin(access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.view");
  return db.select().from(playlists).orderBy(playlists.name);
}

export async function playlistSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(playlists.slug, slug), ne(playlists.id, excludeId))
      : eq(playlists.slug, slug);
  const rows = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertPlaylist(
  input: PlaylistWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.video.edit");
  const result = await db
    .insert(playlists)
    .values(input)
    .returning({ id: playlists.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert playlist");
  return id;
}

export async function updatePlaylist(
  id: number,
  input: PlaylistWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.video.edit");
  const existing = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(eq(playlists.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();
  await db.update(playlists).set(input).where(eq(playlists.id, id));
}

export async function deletePlaylist(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.delete");
  const existing = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(eq(playlists.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();
  await purgeMediaFolder(playlistPath(id));
  await db.delete(playlists).where(eq(playlists.id, id));
}
