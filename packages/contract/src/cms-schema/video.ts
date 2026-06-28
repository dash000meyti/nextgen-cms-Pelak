import type { DocumentSchema } from "./types";

export const videoSchema = {
  type: "video",
  label: "ویدیو",
  labelPlural: "ویدیوها",
  fields: [
    { key: "title", label: "عنوان", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    { key: "description", label: "توضیحات", kind: "textarea" },
    { key: "duration", label: "مدت", kind: "text" },
    {
      key: "thumbnailSrc",
      label: "تصویر بندانگشتی",
      kind: "image",
      required: true,
    },
    { key: "thumbnailAlt", label: "متن جایگزین", kind: "text" },
    { key: "publishedAt", label: "تاریخ انتشار", kind: "text", required: true },
  ],
} satisfies DocumentSchema;
