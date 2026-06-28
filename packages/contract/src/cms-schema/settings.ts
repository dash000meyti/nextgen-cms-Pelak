import type { DocumentSchema } from "./types";

export const siteSettingsSchema = {
  type: "settings",
  label: "تنظیمات سایت",
  labelPlural: "تنظیمات",
  singleton: true,
  fields: [
    { key: "name", label: "نام", kind: "text", required: true },
    { key: "tagline", label: "شعار", kind: "text", required: true },
    { key: "description", label: "توضیحات", kind: "textarea", required: true },
    { key: "logo", label: "لوگو (مسیر)", kind: "text", required: true },
    { key: "contactEmail", label: "ایمیل تماس", kind: "text", required: true },
    {
      key: "defaultTheme",
      label: "تم پیش‌فرض",
      kind: "select",
      options: [
        { value: "light", label: "روشن" },
        { value: "dark", label: "تیره" },
      ],
    },
    {
      key: "defaultDirection",
      label: "جهت متن",
      kind: "select",
      options: [
        { value: "rtl", label: "راست‌به‌چپ" },
        { value: "ltr", label: "چپ‌به‌راست" },
      ],
    },
  ],
} satisfies DocumentSchema;

export const themeSettingsSchema = {
  type: "settings",
  label: "رنگ‌ها",
  labelPlural: "رنگ‌ها",
  singleton: true,
  fields: [
    { key: "light", label: "پالت روشن", kind: "palette" },
    { key: "dark", label: "پالت تیره", kind: "palette" },
  ],
} satisfies DocumentSchema;

export const modulesSettingsSchema = {
  type: "settings",
  label: "ماژول‌ها",
  labelPlural: "ماژول‌ها",
  singleton: true,
  fields: [{ key: "modules", label: "ماژول‌های فعال", kind: "modules" }],
} satisfies DocumentSchema;

export const mediaSettingsSchema = {
  type: "settings",
  label: "مدیا",
  labelPlural: "مدیا",
  singleton: true,
  fields: [
    {
      key: "maxBytes",
      label: "حداکثر حجم (بایت)",
      kind: "number",
      required: true,
    },
    { key: "allowedMime", label: "MIME مجاز", kind: "json" },
    { key: "pipeline", label: "پردازش", kind: "json" },
  ],
} satisfies DocumentSchema;

export const memberSettingsSchema = {
  type: "settings",
  label: "اعضا",
  labelPlural: "اعضا",
  singleton: true,
  fields: [
    {
      key: "defaultRoleId",
      label: "نقش پیش‌فرض",
      kind: "number",
      required: true,
    },
    { key: "allowRegistration", label: "ثبت‌نام عمومی", kind: "boolean" },
    { key: "requireApproval", label: "نیاز به تأیید", kind: "boolean" },
  ],
} satisfies DocumentSchema;

export const contentSettingsSchema = {
  type: "settings",
  label: "محتوا",
  labelPlural: "محتوا",
  singleton: true,
  fields: [
    {
      key: "defaultArticleStatus",
      label: "وضعیت پیش‌فرض",
      kind: "select",
      options: [
        { value: "draft", label: "پیش‌نویس" },
        { value: "published", label: "منتشرشده" },
      ],
    },
    { key: "slugAutoGenerate", label: "slug خودکار", kind: "boolean" },
    {
      key: "homepageArticleCount",
      label: "تعداد مقالات صفحهٔ اصلی",
      kind: "number",
    },
    {
      key: "showAuthorOnCards",
      label: "نمایش نویسنده در کارت",
      kind: "boolean",
    },
  ],
} satisfies DocumentSchema;
