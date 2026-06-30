import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { videos } from "../src/db/schema/videos";
import { promoteVideoThumbnailSrc } from "../src/media/promote-video-thumbnail";

async function main() {
  const rows = await db.select().from(videos);
  let updated = 0;

  for (const video of rows) {
    const thumbnailSrc = await promoteVideoThumbnailSrc(
      video.id,
      video.thumbnailSrc,
    );
    if (thumbnailSrc === video.thumbnailSrc) continue;

    await db
      .update(videos)
      .set({ thumbnailSrc })
      .where(eq(videos.id, video.id));
    updated++;
    console.log(
      `video ${video.id} (${video.slug}): ${video.thumbnailSrc} -> ${thumbnailSrc}`,
    );
  }

  console.log(`Updated ${updated} of ${rows.length} video thumbnail(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
