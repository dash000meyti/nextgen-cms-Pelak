-- Backfill members for authors without a linked member row
INSERT INTO members (
  email,
  password_hash,
  slug,
  name,
  display_role,
  bio,
  avatar_src,
  avatar_alt,
  social_twitter,
  social_telegram,
  social_instagram,
  role_id,
  is_active,
  legacy_author_id,
  created_at,
  updated_at
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
  (SELECT id FROM roles WHERE slug = 'writer' LIMIT 1),
  1,
  a.id,
  datetime('now'),
  datetime('now')
FROM authors a
WHERE NOT EXISTS (
  SELECT 1 FROM members m WHERE m.legacy_author_id = a.id
)
AND NOT EXISTS (
  SELECT 1 FROM members m WHERE m.slug = a.slug
);
