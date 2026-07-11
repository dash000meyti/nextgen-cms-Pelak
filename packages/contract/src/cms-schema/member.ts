import type { DocumentSchema } from "./types";

export const memberSchema = {
  type: "member",
  label: "عضو",
  labelPlural: "اعضا",
  fields: [
    { key: "name", label: "نام", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    {
      key: "username",
      label: "نام کاربری",
      kind: "text",
      required: true,
      unique: true,
    },
    { key: "email", label: "ایمیل", kind: "text" },
    { key: "displayRole", label: "سمت", kind: "text" },
    { key: "bio", label: "بیوگرافی", kind: "textarea" },
    { key: "avatarSrc", label: "تصویر", kind: "image" },
    { key: "roleId", label: "نقش سیستمی", kind: "select", required: true },
    { key: "isActive", label: "فعال", kind: "boolean" },
    { key: "socialTwitter", label: "توییتر", kind: "text" },
    { key: "socialTelegram", label: "تلگرام", kind: "text" },
    { key: "socialInstagram", label: "اینستاگرام", kind: "text" },
  ],
} satisfies DocumentSchema;
