import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const authors = sqliteTable("authors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarSrc: text("avatar_src").notNull(),
  avatarAlt: text("avatar_alt").notNull().default(""),
  socialTwitter: text("social_twitter"),
  socialTelegram: text("social_telegram"),
  socialInstagram: text("social_instagram"),
});

export type AuthorRow = typeof authors.$inferSelect;
export type AuthorInsert = typeof authors.$inferInsert;
