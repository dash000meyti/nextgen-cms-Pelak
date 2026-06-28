import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../src/db/schema/index";
import { resolveSqlitePath } from "../src/platform/paths";
import { getMigrationsDir } from "../src/platform/version";

const sqlitePath = resolveSqlitePath();
mkdirSync(dirname(sqlitePath), { recursive: true });

const sqlite = new Database(sqlitePath);
const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: getMigrationsDir() });

console.log(`Migrated database at ${sqlitePath}`);
sqlite.close();
