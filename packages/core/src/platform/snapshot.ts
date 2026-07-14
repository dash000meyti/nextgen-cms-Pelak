import {
  cpSync,
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

/**
 * Move a file or directory. Uses rename when src/dest share a device;
 * falls back to recursive copy + delete on EXDEV (e.g. /tmp → /data volume).
 */
function movePath(src: string, dest: string): void {
  try {
    renameSync(src, dest);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "EXDEV") {
      throw error;
    }
    cpSync(src, dest, { recursive: true });
    rmSync(src, { recursive: true, force: true });
  }
}

/** Temp dir for snapshot import — on the data volume when possible so rename works. */
export function createSnapshotImportTempDir(): string {
  const backupDir = resolveBackupDir();
  mkdirSync(backupDir, { recursive: true });
  return mkdtempSync(join(backupDir, "pelak-snapshot-import-"));
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

// manifest.json is intentionally FIRST so it lands at the head of the archive:
// it is validated before the bulk payload and stays recoverable even if a
// transfer is truncated mid-stream.
const SNAPSHOT_ENTRY_NAMES = [
  SNAPSHOT_MANIFEST_NAME,
  "pelak.sqlite",
  "uploads",
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

/**
 * Locate the directory that holds `manifest.json`. Handles the common case
 * where an archive was unpacked and re-packed inside a wrapper folder (e.g.
 * macOS Archive Utility), which nests every entry one level deep.
 */
function locateManifestDir(dir: string): string | null {
  if (existsSync(join(dir, SNAPSHOT_MANIFEST_NAME))) return dir;
  let entries: import("node:fs").Dirent[];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (
      entry.isDirectory() &&
      existsSync(join(dir, entry.name, SNAPSHOT_MANIFEST_NAME))
    ) {
      return join(dir, entry.name);
    }
  }
  return null;
}

/** Resolve the snapshot root (dir containing manifest.json) or throw. */
export function resolveSnapshotRoot(dir: string): string {
  const found = locateManifestDir(dir);
  if (found) return found;
  let contents: string[] = [];
  try {
    contents = readdirSync(dir).slice(0, 20);
  } catch {
    // dir unreadable — fall through to generic message
  }
  const hint = contents.length
    ? ` محتوای آرشیو: ${contents.join("، ")}`
    : " (آرشیو خالی یا استخراج‌نشده است)";
  throw new Error(`آرشیو شامل manifest.json نیست؛ snapshot معتبر نیست.${hint}`);
}

export function readManifestFromDir(dir: string): SnapshotManifest {
  const root = resolveSnapshotRoot(dir);
  const raw = readFileSync(join(root, SNAPSHOT_MANIFEST_NAME), "utf-8");
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
    // `gzip: true` handles gzipped bundles; node-tar also tolerates a plain
    // tar here (e.g. if a proxy stripped the gzip layer during download).
    const extractStream = tarExtract({ cwd: tempDir, gzip: true });
    let settled = false;
    const done = (error?: unknown) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else resolve();
    };
    input.on("error", done);
    extractStream.on("error", done);
    // Wait for "close": node-tar flushes all entries to disk before it fires,
    // so manifest.json is guaranteed present. Resolving on "end" (input
    // consumed) can race ahead of the on-disk writes on slow volumes.
    extractStream.on("close", () => done());
    extractStream.on("finish", () => done());
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
  movePath(uploadsDir, dest);
  return dest;
}

export async function restoreSnapshotFromTemp(
  tempDir: string,
): Promise<SnapshotRestoreResult> {
  const root = resolveSnapshotRoot(tempDir);
  const manifest = readManifestFromDir(root);
  const tempDbPath = join(root, "pelak.sqlite");
  const tempUploadsPath = join(root, "uploads");

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
      movePath(tempUploadsPath, uploadsDir);
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
        movePath(backupUploadsPath, uploadsDir);
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
