INSERT INTO `role_permissions` (`role_id`, `permission`)
SELECT `id`, 'settings.database'
FROM `roles`
WHERE `slug` = 'super_admin'
  AND NOT EXISTS (
    SELECT 1
    FROM `role_permissions`
    WHERE `role_permissions`.`role_id` = `roles`.`id`
      AND `role_permissions`.`permission` = 'settings.database'
  );
