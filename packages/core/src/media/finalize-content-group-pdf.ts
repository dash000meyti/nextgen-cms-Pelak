import {
  getMediaAssetByUuid,
  hardDeleteMediaAsset,
  listMediaAssetsInFolder,
  updateMediaAssetFilename,
} from "@nextgen-cms/core/db/repositories/media-assets";
import { buildContentGroupPdfFilename } from "@nextgen-cms/core/media/content-group-pdf";
import { contentGroupPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";
import {
  removeMediaFile,
  renameMediaFile,
} from "@nextgen-cms/core/media/storage";
import {
  parseUploadPublicUrl,
  resolveUploadPublicPath,
} from "@nextgen-cms/core/media/urls";

function filenameUuid(filename: string): string | null {
  const dot = filename.lastIndexOf(".");
  if (dot <= 0) return null;
  return filename.slice(0, dot);
}

export async function purgeContentGroupPdfs(
  contentGroupId: number,
  keepFilename?: string,
): Promise<void> {
  const folder = contentGroupPath(contentGroupId);
  const assets = await listMediaAssetsInFolder(folder);
  for (const asset of assets) {
    if (
      asset.mimeType !== "application/pdf" ||
      (keepFilename != null && asset.filename === keepFilename)
    ) {
      continue;
    }
    await removeMediaFile(asset.folderPath, asset.filename);
    await hardDeleteMediaAsset(asset.id);
  }
}

async function purgeOtherPdfsInFolder(
  folderPath: string,
  keepFilename: string,
): Promise<void> {
  const assets = await listMediaAssetsInFolder(folderPath);
  for (const asset of assets) {
    if (
      asset.mimeType !== "application/pdf" ||
      asset.filename === keepFilename
    ) {
      continue;
    }
    await removeMediaFile(asset.folderPath, asset.filename);
    await hardDeleteMediaAsset(asset.id);
  }
}

export type FinalizeContentGroupPdfInput = {
  contentGroupId: number;
  pdfSrc: string | null | undefined;
  slug: string;
  title: string;
};

export async function finalizeContentGroupPdf(
  input: FinalizeContentGroupPdfInput,
): Promise<string | null> {
  const { contentGroupId, pdfSrc, slug, title } = input;
  if (!pdfSrc?.trim()) {
    await purgeContentGroupPdfs(contentGroupId);
    return null;
  }

  const folder = contentGroupPath(contentGroupId);
  const promoted = await promoteMediaToFolder(pdfSrc.trim(), folder);
  const parsed = parseUploadPublicUrl(promoted);
  if (!parsed?.filename) return promoted;

  const targetFilename = buildContentGroupPdfFilename(title, slug);
  let currentFilename = parsed.filename;

  if (currentFilename !== targetFilename) {
    try {
      await renameMediaFile(folder, currentFilename, targetFilename);
      const uuid = filenameUuid(currentFilename);
      if (uuid) {
        const asset = await getMediaAssetByUuid(uuid);
        if (asset) {
          await updateMediaAssetFilename(
            asset.id,
            targetFilename,
            targetFilename,
          );
        }
      }
      currentFilename = targetFilename;
    } catch {
      // keep existing filename if rename fails (e.g. collision)
    }
  }

  await purgeOtherPdfsInFolder(folder, currentFilename);

  return resolveUploadPublicPath(folder, currentFilename);
}
