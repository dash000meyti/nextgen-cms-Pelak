import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const issues = sqliteTable("issues", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: integer("number").notNull().unique(),
  season: text("season").notNull(),
  year: integer("year").notNull(),
  label: text("label").notNull(),
  coverSrc: text("cover_src").notNull(),
  coverAlt: text("cover_alt").notNull().default(""),
  publishedAt: text("published_at").notNull(),
});

export type IssueRow = typeof issues.$inferSelect;
export type IssueInsert = typeof issues.$inferInsert;
