import type { DocumentSchema } from "./types";

export const authorSchema = {
  type: "author",
  label: "عضو",
  labelPlural: "اعضا",
  fields: [
    { key: "name", label: "نام", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    { key: "role", label: "سمت", kind: "text" },
    { key: "bio", label: "بیوگرافی", kind: "textarea" },
    { key: "avatarSrc", label: "تصویر", kind: "image", required: true },
    { key: "avatarAlt", label: "متن جایگزین", kind: "text" },
    { key: "socialTwitter", label: "توییتر", kind: "text" },
    { key: "socialTelegram", label: "تلگرام", kind: "text" },
    { key: "socialInstagram", label: "اینستاگرام", kind: "text" },
  ],
} satisfies DocumentSchema;
