import type { MediaMetadata } from "@nextgen-cms/contract/types/media";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { articles } from "./articles";
import { members } from "./members";

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    folderPath: text("folder_path").notNull(),
    uploadedByMemberId: integer("uploaded_by_member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    contentId: integer("content_id").references(() => articles.id, {
      onDelete: "set null",
    }),
    createdAt: text("created_at").notNull(),
    metadata: text("metadata", { mode: "json" })
      .$type<MediaMetadata>()
      .notNull()
      .default({}),
    deletedAt: text("deleted_at"),
  },
  (table) => [index("media_assets_folder_path_idx").on(table.folderPath)],
);

export type MediaAssetRow = typeof mediaAssets.$inferSelect;
export type MediaAssetInsert = typeof mediaAssets.$inferInsert;
