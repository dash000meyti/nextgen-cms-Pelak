import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const topics = sqliteTable("topics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
});

export type TopicRow = typeof topics.$inferSelect;
export type TopicInsert = typeof topics.$inferInsert;
