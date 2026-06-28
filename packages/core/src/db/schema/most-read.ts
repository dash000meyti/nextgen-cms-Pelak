import { articles } from "@nextgen-cms/core/db/schema/articles";
import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const mostReadEntries = sqliteTable("most_read_entries", {
  articleId: integer("article_id")
    .primaryKey()
    .references(() => articles.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull(),
});
