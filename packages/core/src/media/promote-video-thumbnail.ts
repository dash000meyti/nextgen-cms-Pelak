import {
  getMediaAssetByUuid,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  isSharedMediaPath,
  videoPath,
} from "@nextgen-cms/core/media/path-policy";
import { moveMediaFile } from "@nextgen-cms/core/media/storage";
import {
  parseUploadPublicUrl,
  resolveUploadPublicPath,
} from "@nextgen-cms/core/media/urls";

function filenameUuid(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return null;
  return filename.slice(0, dot);
}

export async function promoteVideoThumbnailSrc(
  videoId: number,
  thumbnailSrc: string,
): Promise<string> {
  const parsed = parseUploadPublicUrl(thumbnailSrc);
  if (!parsed?.filename) return thumbnailSrc;

  const targetFolder = videoPath(videoId);
  if (parsed.folderPath === targetFolder) return thumbnailSrc;

  const folderKey = parsed.folderPath.replace(/\/$/, "");
  if (isSharedMediaPath(folderKey) || isSharedMediaPath(parsed.folderPath)) {
    return thumbnailSrc;
  }

  await moveMediaFile(parsed.folderPath, targetFolder, parsed.filename);

  const uuid = filenameUuid(parsed.filename);
  if (uuid) {
    const asset = await getMediaAssetByUuid(uuid);
    if (asset) {
      await updateMediaAssetFolder(asset.id, targetFolder, null);
    }
  }

  return resolveUploadPublicPath(targetFolder, parsed.filename);
}
