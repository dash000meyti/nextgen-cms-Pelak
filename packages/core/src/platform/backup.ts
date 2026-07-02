import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

function formatTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export function backupDatabase(
  srcPath: string,
  destDir: string,
): string | null {
  if (!existsSync(srcPath)) {
    return null;
  }

  mkdirSync(destDir, { recursive: true });
  const destPath = join(destDir, `pelak-${formatTimestamp(new Date())}.sqlite`);
  copyFileSync(srcPath, destPath);
  return destPath;
}

export function restoreDatabase(srcPath: string, destPath: string): void {
  if (!existsSync(srcPath)) {
    throw new Error(`Restore source does not exist: ${srcPath}`);
  }
  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
}
