import { contentGroupStatusValues } from "@nextgen-cms/contract/content-group-status";
import type { DocumentField } from "./types";

const CONTENT_GROUP_FIELDS: DocumentField[] = [
  { key: "title", label: "عنوان", kind: "text", required: true },
  { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
  {
    key: "status",
    label: "وضعیت",
    kind: "status",
    options: contentGroupStatusValues.map((value) => ({
      value,
      label:
        value === "draft"
          ? "پیش‌نویس"
          : value === "published"
            ? "منتشرشده"
            : "بایگانی",
    })),
  },
  {
    key: "publishedAt",
    label: "تاریخ انتشار",
    kind: "date",
    required: true,
  },
  { key: "coverSrc", label: "جلد", kind: "image", required: true },
  { key: "coverAlt", label: "متن جایگزین", kind: "text" },
  {
    key: "pdfSrc",
    label: "فایل PDF",
    kind: "text",
    hint: "اختیاری - برای نمایش دکمه دانلود PDF در صفحه عمومی",
  },
  {
    key: "articleIds",
    label: "محتوای متصل",
    kind: "reference",
    collection: "article",
    multiple: true,
  },
];

export const contentGroupSchema = {
  type: "contentGroup",
  label: "گروه محتوا",
  labelPlural: "گروه‌های محتوا",
  fields: CONTENT_GROUP_FIELDS,
} satisfies {
  type: "contentGroup";
  label: string;
  labelPlural: string;
  fields: DocumentField[];
};
