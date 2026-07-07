import type {
  MessageForm,
  MessagePayload,
  MessageStatus,
} from "@nextgen-cms/contract/types/messages";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  form: text("form").notNull().$type<MessageForm>(),
  status: text("status").notNull().$type<MessageStatus>().default("unread"),
  payload: text("payload").notNull().$type<MessagePayload>(),
  createdAt: text("created_at").notNull(),
});

export type MessageRow = typeof messages.$inferSelect;
export type MessageInsert = typeof messages.$inferInsert;
