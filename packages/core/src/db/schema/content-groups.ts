import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentGroups = sqliteTable("content_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: integer("number").notNull().unique(),
  season: text("season").notNull(),
  year: integer("year").notNull(),
  label: text("label").notNull(),
  coverSrc: text("cover_src").notNull(),
  coverAlt: text("cover_alt").notNull().default(""),
  publishedAt: text("published_at").notNull(),
});

export type ContentGroupRow = typeof contentGroups.$inferSelect;
export type ContentGroupInsert = typeof contentGroups.$inferInsert;
