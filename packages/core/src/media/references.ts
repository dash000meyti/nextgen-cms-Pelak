import { db } from "@nextgen-cms/core/db";
import {
  articles,
  authors,
  contentGroups,
  members,
  videos,
} from "@nextgen-cms/core/db/schema";
import { count, eq, like } from "drizzle-orm";

export async function countMediaReferences(publicUrl: string): Promise<number> {
  const pattern = `%${publicUrl}%`;

  const [articleHero] = await db
    .select({ total: count() })
    .from(articles)
    .where(eq(articles.heroSrc, publicUrl));

  const [articleBody] = await db
    .select({ total: count() })
    .from(articles)
    .where(like(articles.body, pattern));

  const [memberAvatar] = await db
    .select({ total: count() })
    .from(members)
    .where(eq(members.avatarSrc, publicUrl));

  const [authorAvatar] = await db
    .select({ total: count() })
    .from(authors)
    .where(eq(authors.avatarSrc, publicUrl));

  const [contentGroupCover] = await db
    .select({ total: count() })
    .from(contentGroups)
    .where(eq(contentGroups.coverSrc, publicUrl));

  const [videoThumb] = await db
    .select({ total: count() })
    .from(videos)
    .where(eq(videos.thumbnailSrc, publicUrl));

  return (
    (articleHero?.total ?? 0) +
    (articleBody?.total ?? 0) +
    (memberAvatar?.total ?? 0) +
    (authorAvatar?.total ?? 0) +
    (contentGroupCover?.total ?? 0) +
    (videoThumb?.total ?? 0)
  );
}

export async function mediaReferenceSummary(
  publicUrl: string,
): Promise<string[]> {
  const refs: string[] = [];
  const pattern = `%${publicUrl}%`;

  const heroHits = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.heroSrc, publicUrl))
    .limit(1);
  if (heroHits.length > 0) refs.push("تصویر شاخص مقاله");

  const bodyHits = await db
    .select({ id: articles.id })
    .from(articles)
    .where(like(articles.body, pattern))
    .limit(1);
  if (bodyHits.length > 0) refs.push("بدنهٔ مقاله");

  const memberHits = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.avatarSrc, publicUrl))
    .limit(1);
  if (memberHits.length > 0) refs.push("آواتار عضو");

  const authorHits = await db
    .select({ id: authors.id })
    .from(authors)
    .where(eq(authors.avatarSrc, publicUrl))
    .limit(1);
  if (authorHits.length > 0) refs.push("آواتار نویسنده");

  const contentGroupHits = await db
    .select({ id: contentGroups.id })
    .from(contentGroups)
    .where(eq(contentGroups.coverSrc, publicUrl))
    .limit(1);
  if (contentGroupHits.length > 0) refs.push("جلد گروه محتوا");

  const videoHits = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.thumbnailSrc, publicUrl))
    .limit(1);
  if (videoHits.length > 0) refs.push("تصویر ویدیو");

  return refs;
}
