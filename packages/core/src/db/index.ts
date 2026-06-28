import * as schema from "@nextgen-cms/core/db/schema";
import { resolveSqlitePath } from "@nextgen-cms/core/platform/paths";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlitePath = resolveSqlitePath();

const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

function createSqlite() {
  return new Database(sqlitePath);
}

const sqlite = globalForDb.sqlite ?? createSqlite();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
