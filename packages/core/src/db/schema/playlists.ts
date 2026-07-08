import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const playlists = sqliteTable("playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  coverSrc: text("cover_src").notNull(),
  coverAlt: text("cover_alt").notNull().default(""),
});

export type PlaylistRow = typeof playlists.$inferSelect;
export type PlaylistInsert = typeof playlists.$inferInsert;
