import type * as schema from "@nextgen-cms/core/db/schema";
import { isPlatformInstalled } from "@nextgen-cms/core/platform/meta";
import type Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type PlatformDb = BetterSQLite3Database<typeof schema>;

export function shouldSeedFromEnv(): boolean {
  return (
    process.env.FIRST_BOOT === "1" || process.argv.includes("--first-boot")
  );
}

export function shouldSeedForce(): boolean {
  return process.argv.includes("--force");
}

export function isFirstBoot(db: PlatformDb): boolean {
  return !isPlatformInstalled(db);
}

export function needsInitialSeed(
  db: PlatformDb,
  sqlite: Database.Database,
): boolean {
  if (isPlatformInstalled(db)) {
    return false;
  }

  const existingAuthors = sqlite
    .prepare("SELECT COUNT(*) as count FROM authors")
    .get() as { count: number };

  return existingAuthors.count === 0;
}

export function shouldRunSeed(
  db: PlatformDb,
  sqlite: Database.Database,
): boolean {
  return (
    shouldSeedForce() || shouldSeedFromEnv() || needsInitialSeed(db, sqlite)
  );
}
