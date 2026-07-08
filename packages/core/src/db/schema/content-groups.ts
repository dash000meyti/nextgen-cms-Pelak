import {
  type ContentGroupStatus,
  contentGroupStatusValues,
} from "@nextgen-cms/contract/content-group-status";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import { articles } from "./articles";

export { contentGroupStatusValues, type ContentGroupStatus };

export const contentGroups = sqliteTable("content_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().$type<ContentGroupStatus>().default("draft"),
  coverSrc: text("cover_src").notNull(),
  coverAlt: text("cover_alt").notNull().default(""),
  pdfSrc: text("pdf_src"),
  publishedAt: text("published_at").notNull(),
  updatedAt: text("updated_at").notNull().default(""),
});

export const articleContentGroups = sqliteTable(
  "article_content_groups",
  {
    articleId: integer("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    contentGroupId: integer("content_group_id")
      .notNull()
      .references(() => contentGroups.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.articleId, table.contentGroupId] })],
);

export type ContentGroupRow = typeof contentGroups.$inferSelect;
export type ContentGroupInsert = typeof contentGroups.$inferInsert;
export type ArticleContentGroupRow = typeof articleContentGroups.$inferSelect;
