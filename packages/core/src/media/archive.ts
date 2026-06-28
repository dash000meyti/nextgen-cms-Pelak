import {
  listMediaAssets,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import { archivedContentPath } from "@nextgen-cms/core/media/path-policy";
import { moveMediaFile } from "@nextgen-cms/core/media/storage";

export async function archiveMediaForContent(
  contentId: number,
): Promise<number> {
  const assets = await listMediaAssets({ contentId });
  const archiveFolder = archivedContentPath(contentId);

  let count = 0;
  for (const asset of assets) {
    await moveMediaFile(asset.folderPath, archiveFolder, asset.filename);
    await updateMediaAssetFolder(asset.id, archiveFolder, null);
    count++;
  }
  return count;
}
