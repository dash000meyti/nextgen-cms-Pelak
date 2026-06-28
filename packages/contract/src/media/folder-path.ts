export function normalizeFolderPath(folder: string): string {
  const normalized = folder.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) {
    return "";
  }
  return `${normalized}/`;
}
