import type * as schema from "@nextgen-cms/core/db/schema";
import { isPlatformInstalled } from "@nextgen-cms/core/platform/meta";
import type Database from "better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type PlatformDb = BetterSQLite3Database<typeof schema>;

export type SeedMode =
  | "auto"
  | "seed-if-empty"
  | "seed-if-no-platform-meta"
  | "never";

export function shouldSeedFromEnv(): boolean {
  return (
    process.env.FIRST_BOOT === "1" || process.argv.includes("--first-boot")
  );
}

export function shouldSeedForce(): boolean {
  return process.argv.includes("--force");
}

export function getSeedMode(): SeedMode {
  const raw = process.env.SEED_MODE?.trim().toLowerCase();
  if (
    raw === "seed-if-empty" ||
    raw === "seed-if-no-platform-meta" ||
    raw === "never"
  ) {
    return raw;
  }
  return "auto";
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
  if (shouldSeedForce() || shouldSeedFromEnv()) {
    return true;
  }

  const mode = getSeedMode();
  if (mode === "never") return false;
  if (mode === "seed-if-no-platform-meta") return isFirstBoot(db);
  if (mode === "seed-if-empty") return needsInitialSeed(db, sqlite);

  return needsInitialSeed(db, sqlite);
}
