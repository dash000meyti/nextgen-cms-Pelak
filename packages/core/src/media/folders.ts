import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type { MediaUploadContext } from "@nextgen-cms/contract/types/media";

export function resolveUploadFolder(context: MediaUploadContext = {}): string {
  if (context.contentId != null) {
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
