import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { contentGroups } from "../src/db/schema";
import { contentGroupPath } from "../src/media/path-policy";
import { promoteMediaToFolder } from "../src/media/promote-media";

async function main() {
  const rows = await db.select().from(contentGroups);
  let updated = 0;

  for (const group of rows) {
    const coverSrc = await promoteMediaToFolder(
      group.coverSrc,
      contentGroupPath(group.id),
    );
    if (coverSrc === group.coverSrc) continue;

    await db
      .update(contentGroups)
      .set({ coverSrc })
      .where(eq(contentGroups.id, group.id));
    updated++;
    console.log(`content-group ${group.id}: cover promoted`);
  }

  console.log(`Updated ${updated} of ${rows.length} content group(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
