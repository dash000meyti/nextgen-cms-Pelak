import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { resolveMediaStoragePath } from "./urls";

export async function ensureFolderDir(
  folderPath: string,
  filename: string,
): Promise<void> {
  const filePath = resolveMediaStoragePath(folderPath, filename);
  await mkdir(dirname(filePath), { recursive: true });
}

export async function saveMediaFile(
  folderPath: string,
  filename: string,
  buffer: Buffer,
): Promise<void> {
  const filePath = resolveMediaStoragePath(folderPath, filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);
}

export async function removeMediaFile(
  folderPath: string,
  filename: string,
): Promise<void> {
  const filePath = resolveMediaStoragePath(folderPath, filename);
  try {
    await unlink(filePath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

export async function moveMediaFile(
  fromFolder: string,
  toFolder: string,
  filename: string,
): Promise<void> {
  const fromPath = resolveMediaStoragePath(fromFolder, filename);
  const toPath = resolveMediaStoragePath(toFolder, filename);
  await mkdir(dirname(toPath), { recursive: true });
  await rename(fromPath, toPath);
}
