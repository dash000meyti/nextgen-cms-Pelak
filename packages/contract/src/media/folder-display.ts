import { normalizeFolderPath } from "./folder-path";

const ROOT_LABELS: Record<string, string> = {
  site: "سایت",
  members: "اعضا",
  content: "محتوا",
  "content-group": "گروه محتوا",
  videos: "ویدیو",
};

const MEMBER_CHILD_LABELS: Record<string, string> = {
  draft: "پیش‌نویس",
};

export function getImmediateChildSegment(
  parentFolder: string,
  folderPath: string,
): string {
  const parent = parentFolder
    ? normalizeFolderPath(parentFolder).replace(/\/$/, "")
    : "";
  const full = normalizeFolderPath(folderPath).replace(/\/$/, "");
  if (!parent) {
    return full.split("/").filter(Boolean)[0] ?? full;
  }
  return (
    full
      .slice(parent.length + 1)
      .split("/")
      .filter(Boolean)[0] ?? full
  );
}

export function getFolderBrowseLabel(
  parentFolder: string,
  folderPath: string,
): string {
  const segment = getImmediateChildSegment(parentFolder, folderPath);
  if (!parentFolder) {
    return ROOT_LABELS[segment] ?? segment;
  }
  const parentNorm = normalizeFolderPath(parentFolder).replace(/\/$/, "");
  if (/^members\/\d+$/.test(parentNorm)) {
    return MEMBER_CHILD_LABELS[segment] ?? segment;
  }
  return segment;
}
