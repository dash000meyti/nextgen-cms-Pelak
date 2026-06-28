import { db } from "@nextgen-cms/core/db";
import { mapTopicRow } from "@nextgen-cms/core/db/mappers/topic";
import { topics } from "@nextgen-cms/core/db/schema";
import { asc, count, eq } from "drizzle-orm";

export async function findAllTopics() {
  const rows = await db.select().from(topics).orderBy(asc(topics.name));
  return rows.map(mapTopicRow);
}

export async function findAllTopicSlugs() {
  const rows = await db.select({ slug: topics.slug }).from(topics);
  return rows.map((row) => row.slug);
}

export async function findTopicBySlug(slug: string) {
  const rows = await db
    .select()
    .from(topics)
    .where(eq(topics.slug, slug))
    .limit(1);

  const row = rows[0];
  return row ? mapTopicRow(row) : undefined;
}

export async function countTopics() {
  const rows = await db.select({ total: count() }).from(topics);
  return rows[0]?.total ?? 0;
}
