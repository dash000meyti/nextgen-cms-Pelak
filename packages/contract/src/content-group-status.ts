export const contentGroupStatusValues = [
  "draft",
  "published",
  "archived",
] as const;
export type ContentGroupStatus = (typeof contentGroupStatusValues)[number];
