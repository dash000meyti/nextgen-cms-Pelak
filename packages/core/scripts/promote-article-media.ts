import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { articles } from "../src/db/schema/articles";
import { promoteArticleMedia } from "../src/media/promote-article-media";

async function revalidateArticleCache() {
  const base = process.env.PELAK_DEV_URL ?? "http://localhost:3134";
  try {
    const response = await fetch(`${base}/api/dev/revalidate`, {
      method: "POST",
    });
    if (response.ok) {
      console.log("Article cache revalidated.");
      return;
    }
  } catch {
    // dev server may be offline
  }
  console.warn(
    "Could not revalidate Next.js cache. Restart dev server or save the article once in admin.",
  );
}

async function main() {
  const rows = await db.select().from(articles);
  let updated = 0;

  for (const article of rows) {
    const promoted = await promoteArticleMedia(
      article.id,
      article.heroSrc,
      article.body,
    );
    if (!promoted.changed) continue;

    await db
      .update(articles)
      .set({ heroSrc: promoted.heroSrc, body: promoted.body })
      .where(eq(articles.id, article.id));
    updated++;
    console.log(`article ${article.id} (${article.slug}): media promoted`);
  }

  console.log(`Updated ${updated} of ${rows.length} article(s).`);
  if (updated > 0) {
    await revalidateArticleCache();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
