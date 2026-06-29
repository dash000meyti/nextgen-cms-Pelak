import { articleStatusValues } from "../article-status";
import type { DocumentSchema } from "./types";

export const articleSchema = {
  type: "article",
  label: "محتوا",
  labelPlural: "محتوا",
  fields: [
    { key: "title", label: "عنوان", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    { key: "subtitle", label: "زیرعنوان", kind: "text" },
    { key: "excerpt", label: "چکیده", kind: "textarea" },
    {
      key: "status",
      label: "وضعیت",
      kind: "status",
      options: articleStatusValues.map((v) => ({
        value: v,
        label:
          v === "draft"
            ? "پیش‌نویس"
            : v === "published"
              ? "منتشرشده"
              : "بایگانی",
      })),
    },
    { key: "heroSrc", label: "تصویر شاخص", kind: "image", required: true },
    { key: "heroAlt", label: "متن جایگزین تصویر", kind: "text" },
    { key: "heroCaption", label: "زیرنویس تصویر", kind: "text" },
    { key: "heroCredit", label: "اعتبار تصویر", kind: "text" },
    { key: "readingMinutes", label: "زمان مطالعه (دقیقه)", kind: "number" },
    {
      key: "contentGroupNumber",
      label: "گروه محتوا",
      kind: "reference",
      collection: "contentGroup",
    },
    {
      key: "memberIds",
      label: "اعضا",
      kind: "reference",
      collection: "member",
      multiple: true,
    },
    {
      key: "topicIds",
      label: "موضوعات",
      kind: "reference",
      collection: "topic",
      multiple: true,
    },
    { key: "isFeatured", label: "محتوای ویژه", kind: "boolean" },
    { key: "isEditorsPick", label: "انتخاب سردبیر", kind: "boolean" },
    { key: "body", label: "متن", kind: "blocks" },
    {
      key: "relatedSlugs",
      label: "محتوای مرتبط (نامک)",
      kind: "textarea",
      hint: "هر نامک در یک خط",
    },
  ],
} satisfies DocumentSchema;
