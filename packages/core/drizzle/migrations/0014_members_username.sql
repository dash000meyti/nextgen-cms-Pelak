ALTER TABLE `members` ADD `username` text;
--> statement-breakpoint
UPDATE `members`
SET `username` = CASE
  WHEN `slug` IS NOT NULL AND trim(`slug`) <> '' THEN lower(replace(trim(`slug`), ' ', '-'))
  WHEN `email` IS NOT NULL AND instr(`email`, '@') > 1 THEN lower(substr(`email`, 1, instr(`email`, '@') - 1))
  ELSE 'member-' || `id`
END
WHERE `username` IS NULL OR trim(`username`) = '';
--> statement-breakpoint
WITH ranked AS (
  SELECT
    `id`,
    `username`,
    ROW_NUMBER() OVER (PARTITION BY `username` ORDER BY `id`) AS `rn`
  FROM `members`
  WHERE `username` IS NOT NULL
)
UPDATE `members`
SET `username` = `username` || '-' || `id`
WHERE `id` IN (
  SELECT `id` FROM ranked WHERE `rn` > 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_username_unique` ON `members` (`username`);
