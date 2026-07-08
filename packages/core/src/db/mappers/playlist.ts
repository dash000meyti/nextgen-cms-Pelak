import type { Playlist } from "@nextgen-cms/contract/types/article";
import type { PlaylistRow } from "@nextgen-cms/core/db/schema/playlists";

export function mapPlaylistRow(row: PlaylistRow): Playlist {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    cover: {
      src: row.coverSrc,
      alt: row.coverAlt,
    },
  };
}
