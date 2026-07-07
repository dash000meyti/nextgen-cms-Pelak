import { join } from "node:path";
import {
  resolveBackupDir,
  resolveSqlitePath,
} from "@nextgen-cms/core/platform/paths";
import { writeSnapshotBundle } from "@nextgen-cms/core/platform/snapshot";

async function main() {
  const sqlitePath = resolveSqlitePath();
  const backupDir = resolveBackupDir(sqlitePath);

  const destArg = process.argv[2];
  const destPath = destArg
    ? destArg
    : join(
        backupDir,
        `pelak-snapshot-${new Date().toISOString().replaceAll(":", "-")}.tar.gz`,
      );

  const { path, manifest } = await writeSnapshotBundle(destPath);
  console.log(`Snapshot bundle written to ${path}`);
  console.log(
    `manifest: schemaRevision=${manifest.schemaRevision ?? "n/a"} ` +
      `dbSize=${manifest.dbSizeBytes}B ` +
      `uploadsFiles=${manifest.uploadsFileCount} ` +
      `uploadsBytes=${manifest.uploadsTotalBytes}B`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
