import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { backupDatabase, restoreDatabase } from "@nextgen-cms/core/platform/backup";
import {
  resolveBackupDir,
  resolveSqlitePath,
} from "@nextgen-cms/core/platform/paths";
import Database from "better-sqlite3";

const srcArg = process.argv[2];
if (!srcArg) {
  console.error("Usage: npm run db:restore -- <sqlite-file-path>");
  process.exit(1);
}

const srcPath = resolve(process.cwd(), srcArg);
if (!existsSync(srcPath)) {
  console.error(`Restore file not found: ${srcPath}`);
  process.exit(1);
}

const sqlitePath = resolveSqlitePath();
const backupDir = resolveBackupDir(sqlitePath);
const backupPath = backupDatabase(sqlitePath, backupDir);
if (backupPath) {
  console.log(`Backup created at ${backupPath}`);
}

restoreDatabase(srcPath, sqlitePath);

try {
  const sqlite = new Database(sqlitePath, { readonly: true });
  sqlite.prepare("SELECT 1").get();
  sqlite.close();
  console.log(`Database restored from ${srcPath}`);
} catch (error) {
  console.error("Restore completed but health check failed.");
  console.error(error);
  process.exit(1);
}
