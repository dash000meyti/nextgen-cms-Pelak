CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`is_system` integer DEFAULT false NOT NULL,
	`description` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_slug_unique` ON `roles` (`slug`);--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`role_id` integer NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission`),
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`password_hash` text,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`display_role` text DEFAULT '' NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`avatar_src` text DEFAULT '' NOT NULL,
	`avatar_alt` text DEFAULT '' NOT NULL,
	`social_twitter` text,
	`social_telegram` text,
	`social_instagram` text,
	`role_id` integer NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`legacy_author_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`legacy_author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_email_unique` ON `members` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `members_slug_unique` ON `members` (`slug`);--> statement-breakpoint
CREATE TABLE `member_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `member_sessions_token_unique` ON `member_sessions` (`token`);--> statement-breakpoint
ALTER TABLE `articles` ADD `created_by_member_id` integer REFERENCES `members`(`id`) ON DELETE set null;--> statement-breakpoint
INSERT INTO `roles` (`slug`, `name`, `is_system`, `description`) VALUES
  ('super_admin', 'مدیر کل', 1, 'دسترسی کامل به همه بخش‌ها'),
  ('editor_in_chief', 'سردبیر', 1, 'مدیریت محتوا و اعضای نویسنده'),
  ('writer', 'نویسنده', 1, 'ایجاد و ویرایش محتوای خود');
--> statement-breakpoint
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission FROM roles r
CROSS JOIN (
  SELECT 'content.create' AS permission UNION ALL
  SELECT 'content.edit_own' UNION ALL
  SELECT 'content.edit_all' UNION ALL
  SELECT 'content.publish' UNION ALL
  SELECT 'members.create' UNION ALL
  SELECT 'members.edit' UNION ALL
  SELECT 'members.delete' UNION ALL
  SELECT 'media.upload' UNION ALL
  SELECT 'media.delete_own' UNION ALL
  SELECT 'media.delete_all' UNION ALL
  SELECT 'media.manage_all' UNION ALL
  SELECT 'settings.site' UNION ALL
  SELECT 'settings.theme' UNION ALL
  SELECT 'settings.modules' UNION ALL
  SELECT 'settings.roles' UNION ALL
  SELECT 'settings.topics' UNION ALL
  SELECT 'settings.content' UNION ALL
  SELECT 'settings.members' UNION ALL
  SELECT 'settings.media' UNION ALL
  SELECT 'settings.personal'
) p
WHERE r.slug = 'super_admin';
--> statement-breakpoint
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission FROM roles r
CROSS JOIN (
  SELECT 'content.create' AS permission UNION ALL
  SELECT 'content.edit_own' UNION ALL
  SELECT 'content.edit_all' UNION ALL
  SELECT 'content.publish' UNION ALL
  SELECT 'members.create' UNION ALL
  SELECT 'media.upload' UNION ALL
  SELECT 'media.delete_own' UNION ALL
  SELECT 'media.delete_all' UNION ALL
  SELECT 'media.manage_all' UNION ALL
  SELECT 'settings.topics' UNION ALL
  SELECT 'settings.modules' UNION ALL
  SELECT 'settings.personal'
) p
WHERE r.slug = 'editor_in_chief';
--> statement-breakpoint
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission FROM roles r
CROSS JOIN (
  SELECT 'content.create' AS permission UNION ALL
  SELECT 'content.edit_own' UNION ALL
  SELECT 'media.upload' UNION ALL
  SELECT 'media.delete_own' UNION ALL
  SELECT 'settings.personal'
) p
WHERE r.slug = 'writer';
--> statement-breakpoint
INSERT INTO `members` (
  `email`, `password_hash`, `slug`, `name`, `display_role`, `bio`,
  `avatar_src`, `avatar_alt`, `social_twitter`, `social_telegram`, `social_instagram`,
  `role_id`, `is_active`, `legacy_author_id`, `created_at`, `updated_at`
)
SELECT
  au.email,
  au.password_hash,
  CASE
    WHEN EXISTS (SELECT 1 FROM authors a WHERE a.slug = LOWER(REPLACE(SUBSTR(au.email, 1, INSTR(au.email, '@') - 1), '.', '-')))
    THEN 'admin-' || LOWER(REPLACE(SUBSTR(au.email, 1, INSTR(au.email, '@') - 1), '.', '-'))
    ELSE LOWER(REPLACE(SUBSTR(au.email, 1, INSTR(au.email, '@') - 1), '.', '-'))
  END,
  SUBSTR(au.email, 1, INSTR(au.email, '@') - 1),
  '',
  '',
  '',
  '',
  NULL,
  NULL,
  NULL,
  (SELECT id FROM roles WHERE slug = 'super_admin'),
  1,
  NULL,
  au.created_at,
  au.created_at
FROM admin_users au;
--> statement-breakpoint
INSERT INTO `members` (
  `email`, `password_hash`, `slug`, `name`, `display_role`, `bio`,
  `avatar_src`, `avatar_alt`, `social_twitter`, `social_telegram`, `social_instagram`,
  `role_id`, `is_active`, `legacy_author_id`, `created_at`, `updated_at`
)
SELECT
  NULL,
  NULL,
  a.slug,
  a.name,
  a.role,
  a.bio,
  a.avatar_src,
  a.avatar_alt,
  a.social_twitter,
  a.social_telegram,
  a.social_instagram,
  (SELECT id FROM roles WHERE slug = 'writer'),
  1,
  a.id,
  datetime('now'),
  datetime('now')
FROM authors a;
--> statement-breakpoint
UPDATE `articles` SET `created_by_member_id` = (
  SELECT m.id FROM article_authors aa
  JOIN members m ON m.legacy_author_id = aa.author_id
  WHERE aa.article_id = articles.id
  ORDER BY aa.sort_order ASC
  LIMIT 1
);
--> statement-breakpoint
INSERT INTO `member_sessions` (`member_id`, `token`, `expires_at`, `created_at`)
SELECT
  m.id,
  s.token,
  s.expires_at,
  s.created_at
FROM admin_sessions s
JOIN admin_users au ON au.id = s.admin_user_id
JOIN members m ON m.email = au.email;
