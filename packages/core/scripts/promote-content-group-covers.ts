import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { contentGroups } from "../src/db/schema/content-groups";
import { promoteContentGroupCoverSrc } from "../src/media/promote-content-group-cover";

async function main() {
  const rows = await db.select().from(contentGroups);
  let updated = 0;

  for (const group of rows) {
    const coverSrc = await promoteContentGroupCoverSrc(
      group.id,
      group.coverSrc,
    );
    if (coverSrc === group.coverSrc) continue;

    await db
      .update(contentGroups)
      .set({ coverSrc })
      .where(eq(contentGroups.id, group.id));
    updated++;
    console.log(
      `content group ${group.number}: ${group.coverSrc} -> ${coverSrc}`,
    );
  }

  console.log(`Updated ${updated} of ${rows.length} content group cover(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
