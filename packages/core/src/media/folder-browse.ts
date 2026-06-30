import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";

export function mergeChildFolders(...folderLists: string[][]): string[] {
  const set = new Set<string>();
  for (const list of folderLists) {
    for (const folder of list) {
      set.add(normalizeFolderPath(folder));
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, "fa"));
}
