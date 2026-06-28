import { join } from "node:path";
import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import { resolveUploadsDir } from "../platform/paths";

export { normalizeFolderPath };

export function resolveMediaStoragePath(
  folderPath: string,
  filename: string,
): string {
  const uploadsDir = resolveUploadsDir();
  const folder = normalizeFolderPath(folderPath);
  return join(uploadsDir, folder, filename);
}

export function resolveUploadPublicPath(
  folderPath: string,
  filename: string,
): string {
  const folder = normalizeFolderPath(folderPath);
  return `/uploads/${folder}${filename}`;
}

export function resolveLegacyUploadPublicPath(filename: string): string {
  return `/uploads/${filename}`;
}
