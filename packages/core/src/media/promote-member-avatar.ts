import {
  getMediaAssetByUuid,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  isSharedMediaPath,
  memberAvatarPath,
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

export async function promoteMemberAvatarUrl(
  memberId: number,
  publicUrl: string,
): Promise<string> {
  const parsed = parseUploadPublicUrl(publicUrl);
  if (!parsed?.filename) return publicUrl;

  const targetFolder = memberAvatarPath(memberId);
  if (parsed.folderPath === targetFolder) return publicUrl;

  const folderKey = parsed.folderPath.replace(/\/$/, "");
  if (isSharedMediaPath(folderKey) || isSharedMediaPath(parsed.folderPath)) {
    return publicUrl;
  }

  try {
    await moveMediaFile(parsed.folderPath, targetFolder, parsed.filename);
  } catch {
    return publicUrl;
  }

  const uuid = filenameUuid(parsed.filename);
  if (uuid) {
    const asset = await getMediaAssetByUuid(uuid);
    if (asset) {
      await updateMediaAssetFolder(asset.id, targetFolder, null);
    }
  }

  return resolveUploadPublicPath(targetFolder, parsed.filename);
}
