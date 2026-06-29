import type { ContentGroupPeriod } from "@nextgen-cms/contract/types/modules";
import type { DocumentField } from "./types";

const BASE_FIELDS: DocumentField[] = [
  {
    key: "number",
    label: "شماره",
    kind: "number",
    required: true,
    unique: true,
  },
  { key: "label", label: "برچسب", kind: "text", required: true },
  { key: "coverSrc", label: "جلد", kind: "image", required: true },
  { key: "coverAlt", label: "متن جایگزین", kind: "text" },
  {
    key: "publishedAt",
    label: "تاریخ انتشار",
    kind: "date",
    required: true,
  },
];

const PERIOD_FIELDS: Record<ContentGroupPeriod, DocumentField[]> = {
  yearly: [
    {
      key: "year",
      label: "سال شمسی",
      kind: "number",
      required: true,
    },
    {
      key: "season",
      label: "دوره",
      kind: "text",
      required: true,
      hint: "سالانه",
    },
  ],
  seasonal: [
    {
      key: "season",
      label: "فصل",
      kind: "select",
      required: true,
      options: [
        { value: "بهار", label: "بهار" },
        { value: "تابستان", label: "تابستان" },
        { value: "پاییز", label: "پاییز" },
        { value: "زمستان", label: "زمستان" },
      ],
    },
    {
      key: "year",
      label: "سال شمسی",
      kind: "number",
      required: true,
    },
  ],
  monthly: [
    {
      key: "season",
      label: "ماه",
      kind: "select",
      required: true,
      options: [
        { value: "فروردین", label: "فروردین" },
        { value: "اردیبهشت", label: "اردیبهشت" },
        { value: "خرداد", label: "خرداد" },
        { value: "تیر", label: "تیر" },
        { value: "مرداد", label: "مرداد" },
        { value: "شهریور", label: "شهریور" },
        { value: "مهر", label: "مهر" },
        { value: "آبان", label: "آبان" },
        { value: "آذر", label: "آذر" },
        { value: "دی", label: "دی" },
        { value: "بهمن", label: "بهمن" },
        { value: "اسفند", label: "اسفند" },
      ],
    },
    {
      key: "year",
      label: "سال شمسی",
      kind: "number",
      required: true,
    },
  ],
  weekly: [
    {
      key: "season",
      label: "هفته",
      kind: "number",
      required: true,
      hint: "شماره هفته در سال",
    },
    {
      key: "year",
      label: "سال شمسی",
      kind: "number",
      required: true,
    },
  ],
};

export function getContentGroupFieldDefs(
  period: ContentGroupPeriod,
): DocumentField[] {
  return [
    ...BASE_FIELDS.slice(0, 1),
    ...PERIOD_FIELDS[period],
    ...BASE_FIELDS.slice(1),
  ];
}

export const CONTENT_GROUP_PERIOD_LABELS: Record<ContentGroupPeriod, string> = {
  yearly: "سالنامه",
  seasonal: "فصلنامه",
  monthly: "ماهنامه",
  weekly: "هفته‌نامه",
};

export const contentGroupSchema = {
  type: "contentGroup",
  label: "گروه محتوا",
  labelPlural: "گروه‌های محتوا",
  fields: getContentGroupFieldDefs("seasonal"),
} satisfies {
  type: "contentGroup";
  label: string;
  labelPlural: string;
  fields: DocumentField[];
};
