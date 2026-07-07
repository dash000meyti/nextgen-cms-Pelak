import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  extractSnapshotBundleFile,
  restoreSnapshotFromTemp,
} from "@nextgen-cms/core/platform/snapshot";

const srcArg = process.argv[2];
if (!srcArg) {
  console.error("Usage: npm run db:restore:snapshot -- <snapshot.tar.gz>");
  process.exit(1);
}

const srcPath = resolve(process.cwd(), srcArg);
if (!existsSync(srcPath)) {
  console.error(`Snapshot file not found: ${srcPath}`);
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), "pelak-snapshot-restore-"));

async function main() {
  const manifest = await extractSnapshotBundleFile(srcPath, tempDir);
  console.log(
    `Extracted snapshot: schemaRevision=${manifest.schemaRevision ?? "n/a"} ` +
      `uploadsFiles=${manifest.uploadsFileCount}`,
  );

  const result = await restoreSnapshotFromTemp(tempDir);
  console.log(`Database restored from ${srcPath}`);
  if (result.backupDbPath) {
    console.log(`Previous DB backed up to ${result.backupDbPath}`);
  }
  if (result.backupUploadsPath) {
    console.log(`Previous uploads backed up to ${result.backupUploadsPath}`);
  }
}

main()
  .catch((error) => {
    console.error("Snapshot restore failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });
