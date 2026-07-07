import { db } from "@nextgen-cms/core/db";
import {
  articles,
  contentGroups,
  members,
  videos,
} from "@nextgen-cms/core/db/schema";
import { asc, inArray } from "drizzle-orm";

export async function findAllArticleIds(): Promise<number[]> {
  const rows = await db.select({ id: articles.id }).from(articles);
  return rows.map((row) => row.id);
}

export async function findArticleIdsByIds(ids: number[]): Promise<number[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ id: articles.id })
    .from(articles)
    .where(inArray(articles.id, ids));
  return rows.map((row) => row.id);
}

export async function findAllContentGroupIds(): Promise<number[]> {
  const rows = await db.select({ id: contentGroups.id }).from(contentGroups);
  return rows.map((row) => row.id);
}

export async function findAllVideoIds(): Promise<number[]> {
  const rows = await db.select({ id: videos.id }).from(videos);
  return rows.map((row) => row.id);
}

export async function findAllMemberIds(): Promise<number[]> {
  const rows = await db
    .select({ id: members.id })
    .from(members)
    .orderBy(asc(members.name));
  return rows.map((row) => row.id);
}
