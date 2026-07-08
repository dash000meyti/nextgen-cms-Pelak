import { playlists } from "@nextgen-cms/core/db/schema/playlists";
import { videos } from "@nextgen-cms/core/db/schema/videos";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

export const videoPlaylists = sqliteTable(
  "video_playlists",
  {
    videoId: integer("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    playlistId: integer("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.videoId, table.playlistId] })],
);
