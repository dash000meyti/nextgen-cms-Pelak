CREATE TABLE `messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `form` text NOT NULL,
  `status` text NOT NULL DEFAULT 'unread',
  `payload` text NOT NULL,
  `created_at` text NOT NULL
);--> statement-breakpoint
ALTER TABLE `site_settings` ADD `messages_settings` text;--> statement-breakpoint
-- Backfill messages_settings from existing contact_email for legacy installs
UPDATE `site_settings`
SET `messages_settings` = json(
  '{"contactMethods":[{"id":"email","label":"ایمیل","value":"' || `contact_email` || '"}]}'
)
WHERE `messages_settings` IS NULL
  AND `contact_email` IS NOT NULL
  AND `contact_email` != '';--> statement-breakpoint
-- Backfill messages + settings.messages permissions for super_admin
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission
FROM `roles` r
CROSS JOIN (
  SELECT 'messages.view' AS permission UNION ALL
  SELECT 'messages.edit' UNION ALL
  SELECT 'messages.delete' UNION ALL
  SELECT 'settings.messages'
) p
WHERE r.slug = 'super_admin'
  AND NOT EXISTS (
    SELECT 1
    FROM `role_permissions` rp
    WHERE rp.role_id = r.id
      AND rp.permission = p.permission
  );--> statement-breakpoint
-- Grant messages.view / messages.edit / settings.messages to editor_in_chief
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission
FROM `roles` r
CROSS JOIN (
  SELECT 'messages.view' AS permission UNION ALL
  SELECT 'messages.edit' UNION ALL
  SELECT 'settings.messages'
) p
WHERE r.slug = 'editor_in_chief'
  AND NOT EXISTS (
    SELECT 1
    FROM `role_permissions` rp
    WHERE rp.role_id = r.id
      AND rp.permission = p.permission
  );
