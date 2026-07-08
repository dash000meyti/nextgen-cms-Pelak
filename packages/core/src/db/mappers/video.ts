import type { Video } from "@nextgen-cms/contract/types/article";
import type { VideoRow } from "@nextgen-cms/core/db/schema/videos";

type MapVideoRowInput = {
  row: VideoRow;
  playlists?: Video["playlists"];
};

export function mapVideoRow({ row, playlists = [] }: MapVideoRowInput): Video {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    duration: row.duration,
    status: row.status,
    linkSource: row.linkSource,
    externalLink: row.externalLink ?? "",
    ...(row.aparatUrl ? { aparatUrl: row.aparatUrl } : {}),
    thumbnail: { src: row.thumbnailSrc, alt: row.thumbnailAlt },
    publishedAt: row.publishedAt,
    playlists,
  };
}
