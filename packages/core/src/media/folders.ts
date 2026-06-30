import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";
import { archivedContentPath } from "@nextgen-cms/core/media/path-policy";

export function resolveUploadFolder(context: MediaUploadContext = {}): string {
  if (context.contentId != null) {
    if (context.mediaHome === "archived") {
      return archivedContentPath(context.contentId);
    }
    return normalizeFolderPath(`content/${context.contentId}`);
  }

  if (context.contentGroupId != null) {
    return normalizeFolderPath(`content-group/${context.contentGroupId}`);
  }

  if (context.videoId != null) {
    return normalizeFolderPath(`videos/${context.videoId}`);
  }

  if (context.memberId != null) {
    return normalizeFolderPath(`content/draft/${context.memberId}`);
  }

  if (context.folder) {
    return normalizeFolderPath(context.folder);
  }

  return normalizeFolderPath("shared/site");
}
