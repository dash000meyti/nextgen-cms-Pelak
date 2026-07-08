#!/bin/sh
set -euo pipefail

export DATABASE_URL="file:/data/pelak.sqlite"
export MIGRATIONS_DIR="/app/packages/core/drizzle/migrations"

mkdir -p /data/backups
mkdir -p /data/uploads
chown -R nextjs:nodejs /data

if [ -f /data/pelak.sqlite ]; then
  if [ "${SNAPSHOT_BEFORE_MIGRATE:-0}" = "1" ]; then
    echo "Taking full snapshot (DB + uploads) before migrate..."
    gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-snapshot.ts
  else
    echo "Backing up database before migrate..."
    gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/backup-db.ts
  fi
fi

echo "Running migrations..."
gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/migrate.ts
gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/migrate-content-group-uploads.ts

if gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/core/scripts/is-first-boot.ts; then
  export FIRST_BOOT=1
  echo "First boot detected; seeding database..."
  gosu nextjs env FIRST_BOOT=1 node ./node_modules/tsx/dist/cli.mjs packages/seed/src/seed.ts --first-boot --force
else
  echo "Existing installation; seed skipped."
  gosu nextjs node ./node_modules/tsx/dist/cli.mjs packages/seed/src/ensure-platform-meta.ts
fi

echo "Starting Next.js..."
exec gosu nextjs node apps/pelak/server.js
