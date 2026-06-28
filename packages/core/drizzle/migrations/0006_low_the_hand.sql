CREATE TABLE `media_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uuid` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`folder_path` text NOT NULL,
	`uploaded_by_member_id` integer NOT NULL,
	`content_id` integer,
	`created_at` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`uploaded_by_member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`content_id`) REFERENCES `articles`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_uuid_unique` ON `media_assets` (`uuid`);--> statement-breakpoint
CREATE INDEX `media_assets_folder_path_idx` ON `media_assets` (`folder_path`);