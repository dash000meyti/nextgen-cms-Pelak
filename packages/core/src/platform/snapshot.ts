import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { PassThrough, type Readable } from "node:stream";
import Database from "better-sqlite3";
import { c as tarCreate, x as tarExtract } from "tar";
import { backupDatabase, restoreDatabase } from "./backup";
import {
  resolveBackupDir,
  resolveSqlitePath,
  resolveUploadsDir,
} from "./paths";
import { CORE_VERSION, getSchemaRevision } from "./version";

export const SNAPSHOT_MANIFEST_NAME = "manifest.json";
export const SNAPSHOT_TYPE = "nextgen-cms-snapshot";
export const SNAPSHOT_MANIFEST_VERSION = 1;

export interface SnapshotManifest {
  type: string;
  version: number;
  schemaRevision: string | null;
  appVersion: string;
  createdAt: string;
  dbSizeBytes: number;
  uploadsFileCount: number;
  uploadsTotalBytes: number;
}

export interface SnapshotRestoreResult {
  ok: true;
  backupDbPath: string | null;
  backupUploadsPath: string | null;
  restoredSchemaRevision: string | null;
  manifest: SnapshotManifest;
}

function formatTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    let entries: import("node:fs").Dirent[];
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile()) {
        out.push(full);
      }
    }
  }
  return out;
}

export function readSchemaRevisionFromDb(dbPath: string): string | null {
  const sqlite = new Database(dbPath, { readonly: true });
  try {
    const row = sqlite
      .prepare(
        "SELECT value FROM platform_meta WHERE key = 'schema_revision' LIMIT 1",
      )
      .get() as { value?: string } | undefined;
    return row?.value ?? null;
  } catch {
    return null;
  } finally {
    sqlite.close();
  }
}

export function buildSnapshotManifest(): SnapshotManifest {
  const dbPath = resolveSqlitePath();
  const uploadsDir = resolveUploadsDir();

  let dbSizeBytes = 0;
  if (existsSync(dbPath)) {
    dbSizeBytes = statSync(dbPath).size;
  }

  const files = walkFiles(uploadsDir);
  let uploadsTotalBytes = 0;
  for (const file of files) {
    try {
      uploadsTotalBytes += statSync(file).size;
    } catch {
      // ignore files that disappear mid-walk
    }
  }

  const schemaRevision = existsSync(dbPath)
    ? readSchemaRevisionFromDb(dbPath)
    : null;

  return {
    type: SNAPSHOT_TYPE,
    version: SNAPSHOT_MANIFEST_VERSION,
    schemaRevision,
    appVersion: `core@${CORE_VERSION}`,
    createdAt: new Date().toISOString(),
    dbSizeBytes,
    uploadsFileCount: files.length,
    uploadsTotalBytes,
  };
}

function serializeManifest(manifest: SnapshotManifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

/**
 * Build a staging dir containing symlinks to the real DB and uploads dir,
 * plus a generated manifest.json. tar with `follow: true` archives the
 * symlink targets as regular files — no copying of uploads content.
 */
function buildStagingDir(manifest: SnapshotManifest): string {
  const staging = mkdtempSync(join(tmpdir(), "pelak-snapshot-stage-"));
  const dbPath = resolve(resolveSqlitePath());
  const uploadsDir = resolve(resolveUploadsDir());

  writeFileSync(
    join(staging, SNAPSHOT_MANIFEST_NAME),
    serializeManifest(manifest),
  );

  if (existsSync(dbPath)) {
    symlinkSync(dbPath, join(staging, "pelak.sqlite"));
  }
  if (existsSync(uploadsDir)) {
    symlinkSync(uploadsDir, join(staging, "uploads"));
  }
  return staging;
}

const SNAPSHOT_ENTRY_NAMES = [
  "pelak.sqlite",
  "uploads",
  SNAPSHOT_MANIFEST_NAME,
];

export async function writeSnapshotBundle(
  destPath: string,
): Promise<{ path: string; manifest: SnapshotManifest }> {
  const manifest = buildSnapshotManifest();
  const staging = buildStagingDir(manifest);
  try {
    mkdirSync(dirname(destPath), { recursive: true });
    await tarCreate(
      {
        gzip: true,
        file: destPath,
        cwd: staging,
        follow: true,
        portable: true,
        noMtime: true,
      },
      SNAPSHOT_ENTRY_NAMES,
    );
    return { path: destPath, manifest };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

/**
 * Returns a Node Readable stream of the gzipped tar bundle.
 * Caller is responsible for consuming the stream; staging dir is cleaned
 * up after the stream ends.
 */
export function streamSnapshotBundle(): {
  stream: Readable;
  manifest: SnapshotManifest;
} {
  const manifest = buildSnapshotManifest();
  const staging = buildStagingDir(manifest);
  const pack = tarCreate(
    {
      gzip: true,
      cwd: staging,
      follow: true,
      portable: true,
      noMtime: true,
    },
    SNAPSHOT_ENTRY_NAMES,
  );
  const out = new PassThrough();
  pack.on("end", () => {
    rmSync(staging, { recursive: true, force: true });
  });
  pack.on("error", (error: unknown) => {
    rmSync(staging, { recursive: true, force: true });
    out.destroy(error instanceof Error ? error : new Error(String(error)));
  });
  pack.pipe(out);
  return { stream: out, manifest };
}

export function readManifestFromDir(dir: string): SnapshotManifest {
  const manifestPath = join(dir, SNAPSHOT_MANIFEST_NAME);
  if (!existsSync(manifestPath)) {
    throw new Error("آرشیو شامل manifest.json نیست؛ snapshot معتبر نیست.");
  }
  const raw = readFileSync(manifestPath, "utf-8");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("manifest.json قابل خواندن نیست.");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    (parsed as SnapshotManifest).type !== SNAPSHOT_TYPE
  ) {
    throw new Error("manifest.json معتبر نیست.");
  }
  return parsed as SnapshotManifest;
}

export async function extractSnapshotBundleFile(
  archivePath: string,
  tempDir: string,
): Promise<SnapshotManifest> {
  mkdirSync(tempDir, { recursive: true });
  await tarExtract({
    file: archivePath,
    cwd: tempDir,
  });
  return readManifestFromDir(tempDir);
}

/**
 * Stream-extract a gzipped tar bundle from `input` into `tempDir`.
 * `input` is typically a Node Readable (e.g. converted from a web stream).
 */
export async function streamExtractSnapshotBundle(
  input: Readable,
  tempDir: string,
): Promise<SnapshotManifest> {
  mkdirSync(tempDir, { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const extractStream = tarExtract({ cwd: tempDir, gzip: true });
    input.on("error", reject);
    extractStream.on("error", reject);
    extractStream.on("end", () => resolve());
    input.pipe(extractStream);
  });
  return readManifestFromDir(tempDir);
}

export function backupUploadsDir(): string | null {
  const uploadsDir = resolveUploadsDir();
  if (!existsSync(uploadsDir)) {
    return null;
  }
  const backupDir = resolveBackupDir();
  mkdirSync(backupDir, { recursive: true });
  const dest = join(backupDir, `uploads-${formatTimestamp(new Date())}`);
  renameSync(uploadsDir, dest);
  return dest;
}

export async function restoreSnapshotFromTemp(
  tempDir: string,
): Promise<SnapshotRestoreResult> {
  const manifest = readManifestFromDir(tempDir);
  const tempDbPath = join(tempDir, "pelak.sqlite");
  const tempUploadsPath = join(tempDir, "uploads");

  // Preflight: validate the sqlite file in the bundle.
  if (!existsSync(tempDbPath)) {
    throw new Error("آرشیو شامل pelak.sqlite نیست.");
  }
  try {
    const sqlite = new Database(tempDbPath, { readonly: true });
    sqlite.prepare("SELECT 1").get();
    sqlite.close();
  } catch {
    throw new Error("فایل sqlite داخل آرشیو معتبر نیست.");
  }

  const incomingRevision = readSchemaRevisionFromDb(tempDbPath);
  const currentRevision = getSchemaRevision();
  if (
    incomingRevision &&
    currentRevision &&
    incomingRevision > currentRevision
  ) {
    throw new Error(
      "نسخه دیتابیس آپلودشده از نسخه فعلی نرم‌افزار جدیدتر است. ابتدا نرم‌افزار را ارتقا دهید.",
    );
  }

  const sqlitePath = resolveSqlitePath();
  const backupDbPath = backupDatabase(sqlitePath, resolveBackupDir(sqlitePath));
  const backupUploadsPath = backupUploadsDir();

  try {
    // Swap DB.
    restoreDatabase(tempDbPath, sqlitePath);

    // Swap uploads.
    const uploadsDir = resolveUploadsDir();
    if (existsSync(uploadsDir)) {
      rmSync(uploadsDir, { recursive: true, force: true });
    }
    mkdirSync(dirname(uploadsDir), { recursive: true });
    if (existsSync(tempUploadsPath)) {
      renameSync(tempUploadsPath, uploadsDir);
    } else {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Final health check.
    const sqlite = new Database(sqlitePath, { readonly: true });
    sqlite.prepare("SELECT 1").get();
    sqlite.close();
  } catch (error) {
    // Rollback DB.
    if (backupDbPath && existsSync(backupDbPath)) {
      try {
        restoreDatabase(backupDbPath, sqlitePath);
      } catch {
        // best-effort; surface original error
      }
    }
    // Rollback uploads.
    const uploadsDir = resolveUploadsDir();
    if (backupUploadsPath && existsSync(backupUploadsPath)) {
      try {
        if (existsSync(uploadsDir)) {
          rmSync(uploadsDir, { recursive: true, force: true });
        }
        renameSync(backupUploadsPath, uploadsDir);
      } catch {
        // best-effort
      }
    }
    throw error;
  }

  return {
    ok: true,
    backupDbPath,
    backupUploadsPath,
    restoredSchemaRevision: incomingRevision,
    manifest,
  };
}
