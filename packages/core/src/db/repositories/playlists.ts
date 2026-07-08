import { db } from "@nextgen-cms/core/db";
import { mapPlaylistRow } from "@nextgen-cms/core/db/mappers/playlist";
import { mapVideoRow } from "@nextgen-cms/core/db/mappers/video";
import { playlists, videoPlaylists, videos } from "@nextgen-cms/core/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export async function findAllPlaylists() {
  const rows = await db.select().from(playlists).orderBy(asc(playlists.name));
  return rows.map(mapPlaylistRow);
}

export async function findAllPlaylistSlugs() {
  const rows = await db.select({ slug: playlists.slug }).from(playlists);
  return rows.map((row) => row.slug);
}

export async function findPlaylistBySlug(slug: string) {
  const rows = await db
    .select()
    .from(playlists)
    .where(eq(playlists.slug, slug))
    .limit(1);
  const row = rows[0];
  return row ? mapPlaylistRow(row) : undefined;
}

export async function findVideosByPlaylistSlug(slug: string) {
  const rows = await db
    .select({ video: videos })
    .from(playlists)
    .innerJoin(videoPlaylists, eq(videoPlaylists.playlistId, playlists.id))
    .innerJoin(videos, eq(videos.id, videoPlaylists.videoId))
    .where(eq(playlists.slug, slug))
    .orderBy(desc(videos.publishedAt));
  return rows
    .map((row) => row.video)
    .filter((row) => row.status === "published")
    .map((row) => mapVideoRow({ row }));
}
