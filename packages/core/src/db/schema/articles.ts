import {
  type ArticleStatus,
  articleStatusValues,
} from "@nextgen-cms/contract/article-status";
import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { contentGroups } from "./content-groups";
import { members } from "./members";

export { articleStatusValues, type ArticleStatus };

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  status: text("status").notNull().$type<ArticleStatus>().default("draft"),
  publishedAt: text("published_at"),
  readingMinutes: integer("reading_minutes").notNull().default(5),
  heroSrc: text("hero_src").notNull(),
  heroAlt: text("hero_alt").notNull().default(""),
  heroCaption: text("hero_caption"),
  heroCredit: text("hero_credit"),
  contentGroupNumber: integer("content_group_number").references(
    () => contentGroups.number,
    {
      onDelete: "set null",
    },
  ),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .notNull()
    .default(false),
  isEditorsPick: integer("is_editors_pick", { mode: "boolean" })
    .notNull()
    .default(false),
  body: text("body", { mode: "json" }).$type<ArticleBlock[]>().notNull(),
  relatedSlugs: text("related_slugs", { mode: "json" })
    .$type<string[]>()
    .notNull(),
  createdByMemberId: integer("created_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "restrict" }),
  updatedAt: text("updated_at").notNull(),
});

export type ArticleRow = typeof articles.$inferSelect;
export type ArticleInsert = typeof articles.$inferInsert;
