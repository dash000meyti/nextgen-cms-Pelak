import { existsSync } from "node:fs";
import * as schema from "@nextgen-cms/core/db/schema";
import {
  isPlatformInstalled,
  setPlatformMeta,
} from "@nextgen-cms/core/platform/meta";
import { resolveSqlitePath } from "@nextgen-cms/core/platform/paths";
import {
  CORE_VERSION,
  getSchemaRevision,
} from "@nextgen-cms/core/platform/version";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlitePath = resolveSqlitePath();

if (!existsSync(sqlitePath)) {
  process.exit(0);
}

const sqlite = new Database(sqlitePath);
const db = drizzle(sqlite, { schema });

if (!isPlatformInstalled(db)) {
  const existingAuthors = sqlite
    .prepare("SELECT COUNT(*) as count FROM authors")
    .get() as { count: number };

  if (existingAuthors.count > 0) {
    setPlatformMeta(db, {
      core_version: CORE_VERSION,
      installed_at: new Date().toISOString(),
      schema_revision: getSchemaRevision(),
    });
    console.log("Backfilled platform_meta for existing installation.");
  }
}

sqlite.close();
