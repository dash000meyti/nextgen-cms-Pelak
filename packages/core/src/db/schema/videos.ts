import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  duration: text("duration").notNull().default(""),
  thumbnailSrc: text("thumbnail_src").notNull(),
  thumbnailAlt: text("thumbnail_alt").notNull().default(""),
  publishedAt: text("published_at").notNull(),
});

export type VideoRow = typeof videos.$inferSelect;
export type VideoInsert = typeof videos.$inferInsert;
