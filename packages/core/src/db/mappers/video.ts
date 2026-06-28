import type { Video } from "@nextgen-cms/contract/types/article";
import type { VideoRow } from "@nextgen-cms/core/db/schema/videos";

export function mapVideoRow(row: VideoRow): Video {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    duration: row.duration,
    thumbnail: { src: row.thumbnailSrc, alt: row.thumbnailAlt },
    publishedAt: row.publishedAt,
  };
}
