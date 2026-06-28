import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import packageJson from "../../package.json" with { type: "json" };

export const CORE_VERSION = packageJson.version;

type MigrationJournal = {
  entries: Array<{ tag: string }>;
};

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function getMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) {
    return process.env.MIGRATIONS_DIR;
  }
  return join(packageRoot, "drizzle/migrations");
}

export function getSchemaRevision(): string {
  const journalPath = join(getMigrationsDir(), "meta/_journal.json");
  const journal = JSON.parse(
    readFileSync(journalPath, "utf-8"),
  ) as MigrationJournal;
  const lastEntry = journal.entries.at(-1);
  if (!lastEntry) {
    throw new Error("No migrations found in journal");
  }
  return lastEntry.tag;
}
