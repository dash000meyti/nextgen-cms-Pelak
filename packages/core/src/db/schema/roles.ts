import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const roles = sqliteTable("roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  description: text("description").notNull().default(""),
});

export type RoleRow = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert;
