import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import {
  hardDeleteMediaAsset,
  listMediaAssets,
  listMediaAssetsInFolder,
  listMediaAssetsInFolderTree,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  removeMediaFile,
  removeMediaFolderDir,
} from "@nextgen-cms/core/media/storage";

async function purgeAssets(assets: Awaited<ReturnType<typeof listMediaAssets>>) {
  const seen = new Set<number>();
  for (const asset of assets) {
    if (seen.has(asset.id)) continue;
    seen.add(asset.id);
    await removeMediaFile(asset.folderPath, asset.filename);
    await hardDeleteMediaAsset(asset.id);
  }
}

export async function purgeMediaFolder(folderPath: string): Promise<void> {
  const normalized = normalizeFolderPath(folderPath);
  const assets = await listMediaAssetsInFolder(normalized);
  await purgeAssets(assets);
  await removeMediaFolderDir(normalized);
}

export async function purgeMediaFolderTree(prefix: string): Promise<void> {
  const normalized = normalizeFolderPath(prefix);
  const assets = await listMediaAssetsInFolderTree(
    normalized.replace(/\/$/, ""),
  );
  await purgeAssets(assets);
  await removeMediaFolderDir(normalized.replace(/\/$/, ""));
}

export async function purgeMediaForContent(contentId: number): Promise<void> {
  const linked = await listMediaAssets({
    contentId,
    includeDeleted: true,
  });
  await purgeAssets(linked);
  await purgeMediaFolder(`content/${contentId}`);
  await purgeMediaFolderTree(`archived/content/${contentId}`);
}
