import { resolveMemberAvatar } from "@nextgen-cms/contract/media/member-avatar";
import type { Author } from "@nextgen-cms/contract/types/article";
import type { AuthorRow } from "@nextgen-cms/core/db/schema/authors";

export function mapAuthorRow(row: AuthorRow, articleCount = 0): Author {
  const social: Author["social"] = {};
  if (row.socialTwitter) social.twitter = row.socialTwitter;
  if (row.socialTelegram) social.telegram = row.socialTelegram;
  if (row.socialInstagram) social.instagram = row.socialInstagram;

  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatar: resolveMemberAvatar(row.avatarSrc, row.name),
    ...(Object.keys(social).length > 0 ? { social } : {}),
    articleCount,
  };
}
