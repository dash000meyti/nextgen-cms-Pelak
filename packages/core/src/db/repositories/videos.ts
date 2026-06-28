import { db } from "@nextgen-cms/core/db";
import { mapVideoRow } from "@nextgen-cms/core/db/mappers/video";
import { videos } from "@nextgen-cms/core/db/schema";
import { asc, count } from "drizzle-orm";

export async function findAllVideos() {
  const rows = await db.select().from(videos).orderBy(asc(videos.publishedAt));
  return rows.map(mapVideoRow);
}

export async function countVideos() {
  const rows = await db.select({ total: count() }).from(videos);
  return rows[0]?.total ?? 0;
}
