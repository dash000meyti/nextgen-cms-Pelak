export const videoStatusValues = ["draft", "published", "archived"] as const;

export type VideoStatus = (typeof videoStatusValues)[number];
