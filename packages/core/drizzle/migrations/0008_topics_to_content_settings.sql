-- Backfill settings.content for roles that have settings.topics (additive; keeps settings.topics)
INSERT INTO role_permissions (role_id, permission)
SELECT rp.role_id, 'settings.content'
FROM role_permissions rp
WHERE rp.permission = 'settings.topics'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp2
    WHERE rp2.role_id = rp.role_id
      AND rp2.permission = 'settings.content'
  );
