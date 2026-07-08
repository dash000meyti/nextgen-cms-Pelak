-- 0019_video_status_links_playlists
-- Add status/link fields to videos and introduce playlists taxonomy for videos.

ALTER TABLE `videos` ADD `status` text DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `link_source` text DEFAULT 'thumbnail' NOT NULL;--> statement-breakpoint
ALTER TABLE `videos` ADD `external_link` text;--> statement-breakpoint
ALTER TABLE `videos` ADD `aparat_url` text;--> statement-breakpoint

UPDATE `videos`
SET `status` = 'published'
WHERE `status` = 'draft';--> statement-breakpoint

CREATE TABLE `playlists` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `cover_src` text NOT NULL,
  `cover_alt` text DEFAULT '' NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX `playlists_slug_unique` ON `playlists` (`slug`);--> statement-breakpoint

CREATE TABLE `video_playlists` (
  `video_id` integer NOT NULL,
  `playlist_id` integer NOT NULL,
  PRIMARY KEY (`video_id`, `playlist_id`),
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade
);
