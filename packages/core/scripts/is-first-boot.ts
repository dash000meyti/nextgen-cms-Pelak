import { existsSync } from "node:fs";
import * as schema from "@nextgen-cms/core/db/schema";
import { needsInitialSeed } from "@nextgen-cms/core/platform/first-boot";
import {
  PROD_DATABASE_URL,
  resolveSqlitePath,
} from "@nextgen-cms/core/platform/paths";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlitePath = resolveSqlitePath(
  process.env.DATABASE_URL ?? PROD_DATABASE_URL,
);

if (!existsSync(sqlitePath)) {
  process.exit(0);
}

const sqlite = new Database(sqlitePath);
const db = drizzle(sqlite, { schema });
const initialSeed = needsInitialSeed(db, sqlite);
sqlite.close();

process.exit(initialSeed ? 0 : 1);
