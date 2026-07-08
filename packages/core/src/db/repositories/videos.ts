import { db } from "@nextgen-cms/core/db";
import { mapPlaylistRow } from "@nextgen-cms/core/db/mappers/playlist";
import { mapVideoRow } from "@nextgen-cms/core/db/mappers/video";
import { playlists, videoPlaylists, videos } from "@nextgen-cms/core/db/schema";
import { count, desc, eq, inArray } from "drizzle-orm";

export async function findAllVideos() {
  const rows = await db.select().from(videos).orderBy(desc(videos.publishedAt));
  const publishedRows = rows.filter((row) => row.status === "published");
  const ids = publishedRows.map((row) => row.id);
  const links =
    ids.length === 0
      ? []
      : await db
          .select({
            videoId: videoPlaylists.videoId,
            playlist: playlists,
          })
          .from(videoPlaylists)
          .innerJoin(playlists, eq(playlists.id, videoPlaylists.playlistId))
          .where(inArray(videoPlaylists.videoId, ids));

  const playlistMap = new Map<number, ReturnType<typeof mapPlaylistRow>[]>();
  for (const link of links) {
    const group = playlistMap.get(link.videoId) ?? [];
    group.push(mapPlaylistRow(link.playlist));
    playlistMap.set(link.videoId, group);
  }

  return publishedRows.map((row) =>
    mapVideoRow({ row, playlists: playlistMap.get(row.id) ?? [] }),
  );
}

export async function countVideos() {
  const rows = await db
    .select({ total: count() })
    .from(videos)
    .where(eq(videos.status, "published"));
  return rows[0]?.total ?? 0;
}
