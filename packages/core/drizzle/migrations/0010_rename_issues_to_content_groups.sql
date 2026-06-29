ALTER TABLE `issues` RENAME TO `content_groups`;--> statement-breakpoint
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
	`content_group_number` integer,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_editors_pick` integer DEFAULT false NOT NULL,
	`body` text NOT NULL,
	`related_slugs` text NOT NULL,
	`created_by_member_id` integer NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`content_group_number`) REFERENCES `content_groups`(`number`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "slug", "title", "subtitle", "excerpt", "status", "published_at", "reading_minutes", "hero_src", "hero_alt", "hero_caption", "hero_credit", "content_group_number", "is_featured", "is_editors_pick", "body", "related_slugs", "created_by_member_id", "updated_at") SELECT "id", "slug", "title", "subtitle", "excerpt", "status", "published_at", "reading_minutes", "hero_src", "hero_alt", "hero_caption", "hero_credit", "issue_number", "is_featured", "is_editors_pick", "body", "related_slugs", "created_by_member_id", "updated_at" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
INSERT INTO role_permissions (role_id, permission)
SELECT DISTINCT rp.role_id, perm.permission
FROM role_permissions rp
CROSS JOIN (
  SELECT 'modules.contentGroup.view' AS permission UNION ALL
  SELECT 'modules.contentGroup.create' UNION ALL
  SELECT 'modules.contentGroup.edit' UNION ALL
  SELECT 'modules.contentGroup.delete'
) AS perm
WHERE rp.permission LIKE 'modules.issues.%'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp2
    WHERE rp2.role_id = rp.role_id
      AND rp2.permission = perm.permission
  );--> statement-breakpoint
DELETE FROM role_permissions WHERE permission LIKE 'modules.issues.%';--> statement-breakpoint
UPDATE site_settings SET
  feature_modules = REPLACE(feature_modules, '"issues"', '"contentGroup"')
WHERE feature_modules LIKE '%"issues"%';--> statement-breakpoint
UPDATE site_settings SET
  module_settings = REPLACE(module_settings, '"issues":', '"contentGroup":')
WHERE module_settings LIKE '%"issues":%';--> statement-breakpoint
UPDATE site_settings SET
  nav_sections = REPLACE(REPLACE(nav_sections, '"/issues"', '"/content-group"'), '"id":"issues"', '"id":"contentGroup"')
WHERE nav_sections LIKE '%/issues%' OR nav_sections LIKE '%"issues"%';--> statement-breakpoint
UPDATE site_settings SET
  footer_columns = REPLACE(footer_columns, '"/issues"', '"/content-group"')
WHERE footer_columns LIKE '%/issues%';--> statement-breakpoint
UPDATE content_groups SET
  cover_src = REPLACE(cover_src, '/uploads/issues/', '/uploads/content-group/')
WHERE cover_src LIKE '%/uploads/issues/%';--> statement-breakpoint
UPDATE media_assets SET
  folder_path = REPLACE(folder_path, 'issues/', 'content-group/')
WHERE folder_path LIKE 'issues/%';
