import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { videos } from "../src/db/schema";
import { videoPath } from "../src/media/path-policy";
import { promoteMediaToFolder } from "../src/media/promote-media";

async function main() {
  const rows = await db.select().from(videos);
  let updated = 0;

  for (const video of rows) {
    const thumbnailSrc = await promoteMediaToFolder(
      video.thumbnailSrc,
      videoPath(video.id),
    );
    if (thumbnailSrc === video.thumbnailSrc) continue;

    await db
      .update(videos)
      .set({ thumbnailSrc })
      .where(eq(videos.id, video.id));
    updated++;
    console.log(`video ${video.id}: thumbnail promoted`);
  }

  console.log(`Updated ${updated} of ${rows.length} video(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
