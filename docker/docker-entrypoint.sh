#!/bin/sh
set -euo pipefail

export DATABASE_URL="file:/data/pelak.sqlite"
export MIGRATIONS_DIR="/app/packages/core/drizzle/migrations"

mkdir -p /data/backups
mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -f /data/pelak.sqlite ]; then
  echo "Backing up database before migrate..."
  su-exec nextjs:nodejs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-db.ts
fi

echo "Running migrations..."
su-exec nextjs:nodejs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/migrate.ts

if su-exec nextjs:nodejs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/is-first-boot.ts; then
  export FIRST_BOOT=1
  echo "First boot detected; seeding database..."
  su-exec nextjs:nodejs env FIRST_BOOT=1 node ./node_modules/tsx/dist/cli.mjs packages/seed/src/seed.ts --first-boot
else
  echo "Existing installation; seed skipped."
  su-exec nextjs:nodejs node ./node_modules/tsx/dist/cli.mjs packages/seed/src/ensure-platform-meta.ts
fi

echo "Starting Next.js..."
exec su-exec nextjs:nodejs node apps/pelak/server.js
