import type { CollectionType } from "@nextgen-cms/contract/cms-schema/types";
import { db } from "@nextgen-cms/core/db";
import {
  articles,
  authors,
  issues,
  members,
  topics,
  videos,
} from "@nextgen-cms/core/db/schema";
import { and, eq, ne } from "drizzle-orm";

export async function slugExists(
  collection: CollectionType,
  slug: string,
  excludeId?: number,
): Promise<boolean> {
  switch (collection) {
    case "article": {
      const where =
        excludeId != null
          ? and(eq(articles.slug, slug), ne(articles.id, excludeId))
          : eq(articles.slug, slug);
      const rows = await db
        .select({ id: articles.id })
        .from(articles)
        .where(where)
        .limit(1);
      return rows.length > 0;
    }
    case "author": {
      const where =
        excludeId != null
          ? and(eq(authors.slug, slug), ne(authors.id, excludeId))
          : eq(authors.slug, slug);
      const rows = await db
        .select({ id: authors.id })
        .from(authors)
        .where(where)
        .limit(1);
      return rows.length > 0;
    }
    case "member": {
      const where =
        excludeId != null
          ? and(eq(members.slug, slug), ne(members.id, excludeId))
          : eq(members.slug, slug);
      const rows = await db
        .select({ id: members.id })
        .from(members)
        .where(where)
        .limit(1);
      return rows.length > 0;
    }
    case "topic": {
      const where =
        excludeId != null
          ? and(eq(topics.slug, slug), ne(topics.id, excludeId))
          : eq(topics.slug, slug);
      const rows = await db
        .select({ id: topics.id })
        .from(topics)
        .where(where)
        .limit(1);
      return rows.length > 0;
    }
    case "video": {
      const where =
        excludeId != null
          ? and(eq(videos.slug, slug), ne(videos.id, excludeId))
          : eq(videos.slug, slug);
      const rows = await db
        .select({ id: videos.id })
        .from(videos)
        .where(where)
        .limit(1);
      return rows.length > 0;
    }
    default:
      return false;
  }
}

export async function issueNumberExists(
  number: number,
  excludeId?: number,
): Promise<boolean> {
  const where =
    excludeId != null
      ? and(eq(issues.number, number), ne(issues.id, excludeId))
      : eq(issues.number, number);
  const rows = await db
    .select({ id: issues.id })
    .from(issues)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function assertUniqueSlug(
  collection: CollectionType,
  slug: string,
  excludeId?: number,
): Promise<string | undefined> {
  const exists = await slugExists(collection, slug, excludeId);
  if (exists) return "این نامک قبلاً استفاده شده است.";
  return undefined;
}
