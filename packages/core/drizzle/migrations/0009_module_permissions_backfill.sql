-- Backfill modules.issues.* and modules.video.* for roles that have settings.content (additive; keeps settings.content)
INSERT INTO role_permissions (role_id, permission)
SELECT rp.role_id, perm.permission
FROM role_permissions rp
CROSS JOIN (
  SELECT 'modules.issues.view' AS permission UNION ALL
  SELECT 'modules.issues.create' UNION ALL
  SELECT 'modules.issues.edit' UNION ALL
  SELECT 'modules.issues.delete' UNION ALL
  SELECT 'modules.video.view' UNION ALL
  SELECT 'modules.video.create' UNION ALL
  SELECT 'modules.video.edit' UNION ALL
  SELECT 'modules.video.delete'
) AS perm
WHERE rp.permission = 'settings.content'
  AND NOT EXISTS (
    SELECT 1
    FROM role_permissions rp2
    WHERE rp2.role_id = rp.role_id
      AND rp2.permission = perm.permission
  );
