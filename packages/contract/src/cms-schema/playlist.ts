import type { DocumentSchema } from "./types";

export const playlistSchema = {
  type: "playlist",
  label: "لیست پخش",
  labelPlural: "لیست‌های پخش",
  fields: [
    { key: "name", label: "نام", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    { key: "description", label: "توضیحات", kind: "textarea" },
    { key: "coverSrc", label: "تصویر کاور", kind: "image", required: true },
    { key: "coverAlt", label: "متن جایگزین", kind: "text" },
  ],
} satisfies DocumentSchema;
