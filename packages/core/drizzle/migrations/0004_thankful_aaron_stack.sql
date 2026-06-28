UPDATE `articles` SET `created_by_member_id` = (
  SELECT m.id FROM article_authors aa
  JOIN members m ON m.legacy_author_id = aa.author_id
  WHERE aa.article_id = articles.id
  ORDER BY aa.sort_order ASC
  LIMIT 1
) WHERE `created_by_member_id` IS NULL;--> statement-breakpoint
UPDATE `articles` SET `created_by_member_id` = (
  SELECT m.id FROM members m
  JOIN roles r ON r.id = m.role_id
  WHERE r.slug = 'super_admin'
  ORDER BY m.id ASC
  LIMIT 1
) WHERE `created_by_member_id` IS NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`reading_minutes` integer DEFAULT 5 NOT NULL,
	`hero_src` text NOT NULL,
	`hero_alt` text DEFAULT '' NOT NULL,
	`hero_caption` text,
	`hero_credit` text,
	`issue_number` integer,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_editors_pick` integer DEFAULT false NOT NULL,
	`body` text NOT NULL,
	`related_slugs` text NOT NULL,
	`created_by_member_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`issue_number`) REFERENCES `issues`(`number`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "slug", "title", "subtitle", "excerpt", "status", "published_at", "reading_minutes", "hero_src", "hero_alt", "hero_caption", "hero_credit", "issue_number", "is_featured", "is_editors_pick", "body", "related_slugs", "created_by_member_id", "updated_at") SELECT "id", "slug", "title", "subtitle", "excerpt", "status", "published_at", "reading_minutes", "hero_src", "hero_alt", "hero_caption", "hero_credit", "issue_number", "is_featured", "is_editors_pick", "body", "related_slugs", "created_by_member_id", "updated_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);