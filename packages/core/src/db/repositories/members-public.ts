import { resolveMemberAvatar } from "@nextgen-cms/contract/media/member-avatar";
import type { Author } from "@nextgen-cms/contract/types/article";
import { db } from "@nextgen-cms/core/db";
import { mapAuthorRow } from "@nextgen-cms/core/db/mappers/author";
import {
  articleAuthors,
  articles,
  authors,
  members,
} from "@nextgen-cms/core/db/schema";
import { and, asc, count, eq } from "drizzle-orm";

async function getArticleCountForAuthorId(authorId: number | null) {
  if (!authorId) return 0;

  const rows = await db
    .select({ total: count() })
    .from(articleAuthors)
    .innerJoin(articles, eq(articleAuthors.articleId, articles.id))
    .where(
      and(
        eq(articleAuthors.authorId, authorId),
        eq(articles.status, "published"),
      ),
    );

  return rows[0]?.total ?? 0;
}

function mapMemberToPublicAuthor(
  member: {
    slug: string;
    name: string;
    displayRole: string;
    bio: string;
    avatarSrc: string;
    avatarAlt: string;
    socialTwitter: string | null;
    socialTelegram: string | null;
    socialInstagram: string | null;
    legacyAuthorId: number | null;
  },
  articleCount: number,
): Author {
  const social: Author["social"] = {};
  if (member.socialTwitter) social.twitter = member.socialTwitter;
  if (member.socialTelegram) social.telegram = member.socialTelegram;
  if (member.socialInstagram) social.instagram = member.socialInstagram;

  return {
    slug: member.slug,
    name: member.name,
    role: member.displayRole,
    bio: member.bio,
    avatar: resolveMemberAvatar(member.avatarSrc, member.name),
    ...(Object.keys(social).length > 0 ? { social } : {}),
    articleCount,
  };
}

export async function findPublicMemberBySlug(
  slug: string,
): Promise<Author | undefined> {
  const rows = await db
    .select()
    .from(members)
    .where(and(eq(members.slug, slug), eq(members.isActive, true)))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;

  const articleCount = await getArticleCountForAuthorId(row.legacyAuthorId);
  return mapMemberToPublicAuthor(row, articleCount);
}

export async function findAllPublicMembers(): Promise<Author[]> {
  const rows = await db
    .select()
    .from(members)
    .where(eq(members.isActive, true))
    .orderBy(asc(members.name));

  const result = await Promise.all(
    rows.map(async (row) => {
      const articleCount = await getArticleCountForAuthorId(row.legacyAuthorId);
      return mapMemberToPublicAuthor(row, articleCount);
    }),
  );
  return result;
}

export async function findAllPublicMemberSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: members.slug })
    .from(members)
    .where(eq(members.isActive, true));
  return rows.map((row) => row.slug);
}

export async function findArticlesByMemberSlug(memberSlug: string) {
  const memberRow = await db
    .select({ legacyAuthorId: members.legacyAuthorId })
    .from(members)
    .where(and(eq(members.slug, memberSlug), eq(members.isActive, true)))
    .limit(1);

  const authorId = memberRow[0]?.legacyAuthorId;
  if (!authorId) return [];

  const authorRows = await db
    .select()
    .from(authors)
    .where(eq(authors.id, authorId))
    .limit(1);

  const author = authorRows[0];
  if (!author) return [];

  const articleCount = await getArticleCountForAuthorId(authorId);
  return { author: mapAuthorRow(author, articleCount), authorId };
}
