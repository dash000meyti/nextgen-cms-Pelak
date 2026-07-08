import {
  type VideoStatus,
  videoStatusValues,
} from "@nextgen-cms/contract/video-status";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export { videoStatusValues, type VideoStatus };

export const videos = sqliteTable("videos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  duration: text("duration").notNull().default(""),
  status: text("status").notNull().$type<VideoStatus>().default("draft"),
  linkSource: text("link_source")
    .notNull()
    .$type<"thumbnail" | "aparat">()
    .default("thumbnail"),
  externalLink: text("external_link"),
  aparatUrl: text("aparat_url"),
  thumbnailSrc: text("thumbnail_src").notNull(),
  thumbnailAlt: text("thumbnail_alt").notNull().default(""),
  publishedAt: text("published_at").notNull(),
});

export type VideoRow = typeof videos.$inferSelect;
export type VideoInsert = typeof videos.$inferInsert;
