import type { Member } from "@nextgen-cms/contract/types/member";

export type MemberRowWithRole = {
  id: number;
  username: string;
  email: string | null;
  passwordHash: string | null;
  slug: string;
  name: string;
  displayRole: string;
  bio: string;
  avatarSrc: string;
  avatarAlt: string;
  socialTwitter: string | null;
  socialTelegram: string | null;
  socialInstagram: string | null;
  roleId: number;
  isActive: boolean;
  legacyAuthorId: number | null;
  createdAt: string;
  updatedAt: string;
  roleSlug: string;
  roleName: string;
  roleIsSystem: boolean;
  roleDescription: string;
};

export function mapMemberRow(row: MemberRowWithRole): Member {
  const social: NonNullable<Member["social"]> = {};
  if (row.socialTwitter) social.twitter = row.socialTwitter;
  if (row.socialTelegram) social.telegram = row.socialTelegram;
  if (row.socialInstagram) social.instagram = row.socialInstagram;

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    slug: row.slug,
    name: row.name,
    displayRole: row.displayRole,
    bio: row.bio,
    avatar: { src: row.avatarSrc, alt: row.avatarAlt },
    ...(Object.keys(social).length > 0 ? { social } : {}),
    role: {
      id: row.roleId,
      slug: row.roleSlug,
      name: row.roleName,
      isSystem: row.roleIsSystem,
      description: row.roleDescription,
    },
    isActive: row.isActive,
    legacyAuthorId: row.legacyAuthorId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
