import { adminUsers } from "@nextgen-cms/core/db/schema/admin-users";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const adminSessions = sqliteTable("admin_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  adminUserId: integer("admin_user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export type AdminSessionRow = typeof adminSessions.$inferSelect;
