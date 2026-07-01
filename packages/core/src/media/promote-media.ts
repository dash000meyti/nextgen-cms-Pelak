import {
  getMediaAssetByUuid,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import { shouldSkipMediaPromote } from "@nextgen-cms/core/media/path-policy";
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

export type PromoteMediaOptions = {
  contentId?: number | null;
};

export async function promoteMediaToFolder(
  publicUrl: string,
  targetFolder: string,
  options: PromoteMediaOptions = {},
): Promise<string> {
  const parsed = parseUploadPublicUrl(publicUrl);
  if (!parsed?.filename) return publicUrl;

  const normalizedTarget = targetFolder.replace(/\/$/, "");
  const sourceFolder = parsed.folderPath;
  const sourceKey = sourceFolder.replace(/\/$/, "");

  if (sourceKey === normalizedTarget || sourceFolder === targetFolder) {
    return publicUrl;
  }

  if (shouldSkipMediaPromote(sourceFolder)) {
    return publicUrl;
  }

  try {
    await moveMediaFile(sourceFolder, targetFolder, parsed.filename);
  } catch {
    return publicUrl;
  }

  const uuid = filenameUuid(parsed.filename);
  if (uuid) {
    const asset = await getMediaAssetByUuid(uuid);
    if (asset) {
      await updateMediaAssetFolder(
        asset.id,
        targetFolder,
        options.contentId !== undefined ? options.contentId : undefined,
      );
    }
  }

  return resolveUploadPublicPath(targetFolder, parsed.filename);
}
