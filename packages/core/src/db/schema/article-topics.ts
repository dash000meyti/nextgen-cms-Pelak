import { articles } from "@nextgen-cms/core/db/schema/articles";
import { topics } from "@nextgen-cms/core/db/schema/topics";
import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";

export const articleTopics = sqliteTable(
  "article_topics",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.topicId] })],
);
