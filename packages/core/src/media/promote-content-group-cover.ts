import {
  getMediaAssetByUuid,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  contentGroupPath,
  isSharedMediaPath,
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

export async function promoteContentGroupCoverSrc(
  contentGroupId: number,
  coverSrc: string,
): Promise<string> {
  const parsed = parseUploadPublicUrl(coverSrc);
  if (!parsed?.filename) return coverSrc;

  const targetFolder = contentGroupPath(contentGroupId);
  if (parsed.folderPath === targetFolder) return coverSrc;

  const folderKey = parsed.folderPath.replace(/\/$/, "");
  if (isSharedMediaPath(folderKey) || isSharedMediaPath(parsed.folderPath)) {
    return coverSrc;
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
