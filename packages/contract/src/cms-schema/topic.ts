import type { DocumentSchema } from "./types";

export const topicSchema = {
  type: "topic",
  label: "موضوع",
  labelPlural: "موضوعات",
  fields: [
    { key: "name", label: "نام", kind: "text", required: true },
    { key: "slug", label: "نامک", kind: "slug", required: true, unique: true },
    { key: "description", label: "توضیحات", kind: "textarea" },
  ],
} satisfies DocumentSchema;
