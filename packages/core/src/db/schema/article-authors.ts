import { articles } from "@nextgen-cms/core/db/schema/articles";
import { authors } from "@nextgen-cms/core/db/schema/authors";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

export const articleAuthors = sqliteTable(
  "article_authors",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    authorId: integer("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.authorId] })],
);
