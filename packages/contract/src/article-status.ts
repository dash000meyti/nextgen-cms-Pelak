export const articleStatusValues = ["draft", "published", "archived"] as const;
export type ArticleStatus = (typeof articleStatusValues)[number];
