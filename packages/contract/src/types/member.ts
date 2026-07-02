import type { Permission } from "../permissions";
import type { DefaultRoleSlug } from "../roles";
import type { ImageMeta } from "./article";

export type Role = {
  id: number;
  slug: DefaultRoleSlug | string;
  name: string;
  isSystem: boolean;
  description: string;
};

export type MemberProfile = {
  slug: string;
  name: string;
  displayRole: string;
  bio: string;
  avatar: ImageMeta;
  social?: {
    twitter?: string;
    telegram?: string;
    instagram?: string;
  };
};

export type Member = MemberProfile & {
  id: number;
  username: string;
  email: string | null;
  role: Role;
  isActive: boolean;
  legacyAuthorId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MemberSession = {
  memberId: number;
  username: string;
  email: string | null;
  role: Role;
  permissions: Permission[];
};

export type MemberListRow = {
  id: number;
  slug: string;
  name: string;
  username: string;
  email: string | null;
  roleName: string;
  roleSlug: string;
  isActive: boolean;
  articleCount: number;
};
