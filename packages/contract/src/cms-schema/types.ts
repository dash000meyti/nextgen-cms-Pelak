export type FieldKind =
  | "text"
  | "textarea"
  | "slug"
  | "select"
  | "number"
  | "boolean"
  | "image"
  | "blocks"
  | "reference"
  | "status"
  | "json"
  | "palette"
  | "modules"
  | "date";

export type CollectionType =
  | "article"
  | "author"
  | "member"
  | "topic"
  | "issue"
  | "video"
  | "settings";

export type DocumentField = {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  unique?: boolean;
  multiple?: boolean;
  collection?: CollectionType;
  options?: { value: string; label: string }[];
  hint?: string;
};

export type DocumentSchema = {
  type: CollectionType;
  label: string;
  labelPlural: string;
  singleton?: boolean;
  fields: DocumentField[];
};
