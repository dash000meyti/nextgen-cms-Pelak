import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export const PROD_DATABASE_URL = "file:/data/pelak.sqlite";

function findRepoDataDir(): string {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, "data"),
    join(cwd, "../../data"),
    join(cwd, "../data"),
  ];

  for (const dir of candidates) {
    if (existsSync(dir)) {
      return dir;
    }
  }

  const fallback = join(cwd, "data");
  mkdirSync(fallback, { recursive: true });
  return fallback;
}

export function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  return `file:${join(findRepoDataDir(), "pelak.sqlite")}`;
}

export function resolveSqlitePath(databaseUrl?: string): string {
  const url = databaseUrl ?? resolveDatabaseUrl();
  if (!url.startsWith("file:")) {
    throw new Error(`Unsupported DATABASE_URL: ${url}`);
  }
  return url.replace(/^file:/, "");
}

export function resolveBackupDir(sqlitePath?: string): string {
  const path = sqlitePath ?? resolveSqlitePath();
  if (path.startsWith("/data/")) {
    return "/data/backups";
  }
  return join(dirname(path), "backups");
}

export function resolveUploadsDir(): string {
  const sqlitePath = resolveSqlitePath();
  if (sqlitePath.startsWith("/data/")) {
    return "/data/uploads";
  }
  return join(dirname(sqlitePath), "uploads");
}
