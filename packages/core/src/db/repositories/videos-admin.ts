import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { playlists, videoPlaylists, videos } from "@nextgen-cms/core/db/schema";
import type { videoStatusValues } from "@nextgen-cms/core/db/schema/videos";
import { videoPath } from "@nextgen-cms/core/media/path-policy";
import { purgeMediaFolder } from "@nextgen-cms/core/media/purge-folder";
import { and, eq, inArray, ne } from "drizzle-orm";

export type VideoWriteInput = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  status: (typeof videoStatusValues)[number];
  linkSource: "thumbnail" | "aparat";
  externalLink: string | null;
  aparatUrl: string | null;
  thumbnailSrc: string;
  thumbnailAlt: string;
  publishedAt: string;
  playlistIds: number[];
};

export async function findVideoById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(access.memberId, "modules.video.view");
    } catch {
      return undefined;
    }
  }

  const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return rows[0];
}

export async function findAllVideosAdmin(
  access: AdminAccess,
  options?: { status?: (typeof videoStatusValues)[number] },
) {
  await assertMemberPermission(access.memberId, "modules.video.view");
  const where = options?.status ? eq(videos.status, options.status) : undefined;
  return db.select().from(videos).where(where).orderBy(videos.publishedAt);
}

export async function videoSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(videos.slug, slug), ne(videos.id, excludeId))
      : eq(videos.slug, slug);
  const rows = await db
    .select({ id: videos.id })
    .from(videos)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertVideo(input: VideoWriteInput, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.create");

  const result = await db
    .insert(videos)
    .values({
      slug: input.slug,
      title: input.title,
      description: input.description,
      duration: input.duration,
      status: input.status,
      linkSource: input.linkSource,
      externalLink: input.externalLink,
      aparatUrl: input.aparatUrl,
      thumbnailSrc: input.thumbnailSrc,
      thumbnailAlt: input.thumbnailAlt,
      publishedAt: input.publishedAt,
    })
    .returning({ id: videos.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert video");
  await syncVideoPlaylists(id, input.playlistIds);
  return id;
}

export async function updateVideo(
  id: number,
  input: VideoWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.video.edit");

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db
    .update(videos)
    .set({
      slug: input.slug,
      title: input.title,
      description: input.description,
      duration: input.duration,
      status: input.status,
      linkSource: input.linkSource,
      externalLink: input.externalLink,
      aparatUrl: input.aparatUrl,
      thumbnailSrc: input.thumbnailSrc,
      thumbnailAlt: input.thumbnailAlt,
      publishedAt: input.publishedAt,
    })
    .where(eq(videos.id, id));

  await syncVideoPlaylists(id, input.playlistIds);
}

export async function deleteVideo(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.delete");

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await purgeMediaFolder(videoPath(id));
  await db.delete(videos).where(eq(videos.id, id));
}

export async function setVideoStatus(
  id: number,
  status: (typeof videoStatusValues)[number],
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.video.edit");

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db.update(videos).set({ status }).where(eq(videos.id, id));
}

export async function findVideoPlaylistIds(videoId: number) {
  const rows = await db
    .select({ playlistId: videoPlaylists.playlistId })
    .from(videoPlaylists)
    .where(eq(videoPlaylists.videoId, videoId));
  return rows.map((row) => row.playlistId);
}

export async function findPlaylistOptionsForVideo(videoId: number) {
  const linked = await db
    .select({
      id: playlists.id,
      slug: playlists.slug,
      name: playlists.name,
    })
    .from(videoPlaylists)
    .innerJoin(playlists, eq(playlists.id, videoPlaylists.playlistId))
    .where(eq(videoPlaylists.videoId, videoId));
  return linked;
}

async function syncVideoPlaylists(videoId: number, playlistIds: number[]) {
  await db.delete(videoPlaylists).where(eq(videoPlaylists.videoId, videoId));
  if (playlistIds.length === 0) return;
  const validPlaylists = await db
    .select({ id: playlists.id })
    .from(playlists)
    .where(inArray(playlists.id, playlistIds));
  if (validPlaylists.length === 0) return;
  await db.insert(videoPlaylists).values(
    validPlaylists.map((playlist) => ({
      videoId,
      playlistId: playlist.id,
    })),
  );
}
