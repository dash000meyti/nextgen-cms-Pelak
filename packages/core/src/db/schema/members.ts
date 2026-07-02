import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { authors } from "./authors";
import { roles } from "./roles";

export const members = sqliteTable("members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  displayRole: text("display_role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarSrc: text("avatar_src").notNull().default(""),
  avatarAlt: text("avatar_alt").notNull().default(""),
  socialTwitter: text("social_twitter"),
  socialTelegram: text("social_telegram"),
  socialInstagram: text("social_instagram"),
  roleId: integer("role_id")
    .notNull()
    .references(() => roles.id),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  legacyAuthorId: integer("legacy_author_id").references(() => authors.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export type MemberRow = typeof members.$inferSelect;
export type MemberInsert = typeof members.$inferInsert;
