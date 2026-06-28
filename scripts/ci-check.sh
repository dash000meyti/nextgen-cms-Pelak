#!/usr/bin/env bash
set -euo pipefail

echo "==> biome check"
npm run lint

echo "==> build pelak"
npm run build:pelak

echo "==> migration dry-run"
DATABASE_URL="file:./data/ci-test.sqlite" MIGRATIONS_DIR="./drizzle/migrations" \
  npm run db:migrate -w @nextgen-cms/core

echo "==> CI check passed"
