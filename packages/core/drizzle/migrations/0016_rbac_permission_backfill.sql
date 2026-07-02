-- Ensure super_admin has every current permission (modules.*, settings.database, etc.)
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, p.permission
FROM `roles` r
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
  SELECT 'settings.database' UNION ALL
  SELECT 'settings.personal' UNION ALL
  SELECT 'modules.contentGroup.view' UNION ALL
  SELECT 'modules.contentGroup.create' UNION ALL
  SELECT 'modules.contentGroup.edit' UNION ALL
  SELECT 'modules.contentGroup.delete' UNION ALL
  SELECT 'modules.video.view' UNION ALL
  SELECT 'modules.video.create' UNION ALL
  SELECT 'modules.video.edit' UNION ALL
  SELECT 'modules.video.delete' UNION ALL
  SELECT 'modules.newsletter.manage'
) p
WHERE r.slug = 'super_admin'
  AND NOT EXISTS (
    SELECT 1
    FROM `role_permissions` rp
    WHERE rp.role_id = r.id
      AND rp.permission = p.permission
  );
--> statement-breakpoint
-- Backfill newsletter.manage for editor_in_chief when settings.content is present
INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT r.id, 'modules.newsletter.manage'
FROM `roles` r
WHERE r.slug = 'editor_in_chief'
  AND EXISTS (
    SELECT 1
    FROM `role_permissions` rp
    WHERE rp.role_id = r.id
      AND rp.permission = 'settings.content'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM `role_permissions` rp
    WHERE rp.role_id = r.id
      AND rp.permission = 'modules.newsletter.manage'
  );
