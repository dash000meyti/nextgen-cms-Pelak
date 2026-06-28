import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { members } from "./members";

export const memberSessions = sqliteTable("member_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  memberId: integer("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export type MemberSessionRow = typeof memberSessions.$inferSelect;
export type MemberSessionInsert = typeof memberSessions.$inferInsert;
