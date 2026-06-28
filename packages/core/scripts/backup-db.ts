import { backupDatabase } from "@nextgen-cms/core/platform/backup";
import {
  resolveBackupDir,
  resolveSqlitePath,
} from "@nextgen-cms/core/platform/paths";

const sqlitePath = resolveSqlitePath();
const backupDir = resolveBackupDir(sqlitePath);
const backupPath = backupDatabase(sqlitePath, backupDir);

if (backupPath) {
  console.log(`Backed up database to ${backupPath}`);
} else {
  console.log(`No database found at ${sqlitePath}; backup skipped.`);
}
