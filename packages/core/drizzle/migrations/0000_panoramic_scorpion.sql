CREATE TABLE `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar_src` text NOT NULL,
	`avatar_alt` text DEFAULT '' NOT NULL,
	`social_twitter` text,
	`social_telegram` text,
	`social_instagram` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `authors_slug_unique` ON `authors` (`slug`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE TABLE `issues` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`season` text NOT NULL,
	`year` integer NOT NULL,
	`label` text NOT NULL,
	`cover_src` text NOT NULL,
	`cover_alt` text DEFAULT '' NOT NULL,
	`published_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `issues_number_unique` ON `issues` (`number`);--> statement-breakpoint
CREATE TABLE `articles` (
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
	`updated_at` text NOT NULL,
	FOREIGN KEY (`issue_number`) REFERENCES `issues`(`number`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `articles_slug_unique` ON `articles` (`slug`);--> statement-breakpoint
CREATE TABLE `article_authors` (
	`article_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`article_id`, `author_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `article_topics` (
	`article_id` integer NOT NULL,
	`topic_id` integer NOT NULL,
	PRIMARY KEY(`article_id`, `topic_id`),
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`duration` text DEFAULT '' NOT NULL,
	`thumbnail_src` text NOT NULL,
	`thumbnail_alt` text DEFAULT '' NOT NULL,
	`published_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_slug_unique` ON `videos` (`slug`);--> statement-breakpoint
CREATE TABLE `most_read_entries` (
	`article_id` integer PRIMARY KEY NOT NULL,
	`sort_order` integer NOT NULL,
	FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tagline` text NOT NULL,
	`description` text NOT NULL,
	`logo` text NOT NULL,
	`default_theme` text NOT NULL,
	`default_direction` text NOT NULL,
	`typography` text NOT NULL,
	`nav_sections` text NOT NULL,
	`utility_links` text NOT NULL,
	`footer_columns` text NOT NULL,
	`social_links` text NOT NULL,
	`hot_topics` text NOT NULL,
	`contact_email` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_sessions_token_unique` ON `admin_sessions` (`token`);