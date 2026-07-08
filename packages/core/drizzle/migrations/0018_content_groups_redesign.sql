-- 0018_content_groups_redesign
-- Redesign content groups: drop period (number/season/year/label), add slug/title/status,
-- and move the article↔content-group link to a many-to-many junction table.
-- Existing data is migrated: slug from number, title from label, junction from content_group_number.

PRAGMA foreign_keys=OFF;--> statement-breakpoint

ALTER TABLE `content_groups` ADD `slug` text;--> statement-breakpoint
ALTER TABLE `content_groups` ADD `title` text;--> statement-breakpoint
ALTER TABLE `content_groups` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `content_groups` ADD `updated_at` text DEFAULT '' NOT NULL;--> statement-breakpoint

CREATE TABLE `article_content_groups` (
	`article_id` integer NOT NULL,
	`content_group_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY (`article_id`, `content_group_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`content_group_id`) REFERENCES `content_groups`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

-- Backfill slug (from unique number, preserving URLs), title (from label), status
UPDATE `content_groups` SET `slug` = CAST(`number` AS TEXT), `title` = `label`, `status` = 'published', `updated_at` = '';--> statement-breakpoint

-- Backfill junction from the legacy articles.content_group_number column
INSERT INTO `article_content_groups` (`article_id`, `content_group_id`, `sort_order`)
SELECT a.`id`, cg.`id`, 0
FROM `articles` a
JOIN `content_groups` cg ON a.`content_group_number` = cg.`number`
WHERE a.`content_group_number` IS NOT NULL;--> statement-breakpoint

-- Rebuild content_groups without number/season/year/label, with unique slug
CREATE TABLE `__new_content_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`cover_src` text NOT NULL,
	`cover_alt` text DEFAULT '' NOT NULL,
	`pdf_src` text,
	`published_at` text NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);--> statement-breakpoint
INSERT INTO `__new_content_groups`(`id`, `slug`, `title`, `status`, `cover_src`, `cover_alt`, `pdf_src`, `published_at`, `updated_at`)
SELECT `id`, `slug`, `title`, `status`, `cover_src`, `cover_alt`, `pdf_src`, `published_at`, `updated_at` FROM `content_groups`;--> statement-breakpoint
DROP TABLE `content_groups`;--> statement-breakpoint
ALTER TABLE `__new_content_groups` RENAME TO `content_groups`;--> statement-breakpoint
CREATE UNIQUE INDEX `content_groups_slug_unique` ON `content_groups` (`slug`);--> statement-breakpoint

-- Rebuild articles without content_group_number
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
	`is_featured` integer DEFAULT false NOT NULL,
	`is_editors_pick` integer DEFAULT false NOT NULL,
	`body` text NOT NULL,
	`related_slugs` text NOT NULL,
	`created_by_member_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict
);--> statement-breakpoint
INSERT INTO `__new_articles`(`id`, `slug`, `title`, `subtitle`, `excerpt`, `status`, `published_at`, `reading_minutes`, `hero_src`, `hero_alt`, `hero_caption`, `hero_credit`, `is_featured`, `is_editors_pick`, `body`, `related_slugs`, `created_by_member_id`, `updated_at`)
SELECT `id`, `slug`, `title`, `subtitle`, `excerpt`, `status`, `published_at`, `reading_minutes`, `hero_src`, `hero_alt`, `hero_caption`, `hero_credit`, `is_featured`, `is_editors_pick`, `body`, `related_slugs`, `created_by_member_id`, `updated_at` FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint

-- Drop the legacy content group module settings' period/groupByYear fields (JSON stored in site_settings)
UPDATE `site_settings`
SET `content_group_module_settings` = json_remove(
  `content_group_module_settings`,
  '$.period',
  '$.groupByYear'
)
WHERE `content_group_module_settings` IS NOT NULL;--> statement-breakpoint

PRAGMA foreign_keys=ON;
