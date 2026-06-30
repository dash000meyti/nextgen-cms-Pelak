import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import {
  listMediaAssetsInFolderTree,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  archivedContentPath,
  contentPath,
} from "@nextgen-cms/core/media/path-policy";
import { moveMediaFile } from "@nextgen-cms/core/media/storage";
import {
  parseUploadPublicUrl,
  resolveUploadPublicPath,
} from "@nextgen-cms/core/media/urls";

export type ContentMediaHome = "active" | "archived";

export function contentMediaFolder(
  contentId: number,
  home: ContentMediaHome,
): string {
  return home === "archived"
    ? archivedContentPath(contentId)
    : contentPath(contentId);
}

function sourceHomeForTarget(target: ContentMediaHome): ContentMediaHome {
  return target === "archived" ? "active" : "archived";
}

function rewriteUploadUrl(
  publicUrl: string,
  sourceFolder: string,
  targetFolder: string,
): string {
  const parsed = parseUploadPublicUrl(publicUrl);
  if (!parsed?.filename) return publicUrl;
  if (parsed.folderPath === sourceFolder) {
    return resolveUploadPublicPath(targetFolder, parsed.filename);
  }
  return publicUrl;
}

export async function relocateArticleMedia(
  contentId: number,
  targetHome: ContentMediaHome,
  heroSrc: string,
  body: ArticleBlock[],
): Promise<{ heroSrc: string; body: ArticleBlock[]; changed: boolean }> {
  const sourceHome = sourceHomeForTarget(targetHome);
  const sourceFolder = contentMediaFolder(contentId, sourceHome);
  const targetFolder = contentMediaFolder(contentId, targetHome);
  const linkedContentId = targetHome === "active" ? contentId : null;

  const assets = await listMediaAssetsInFolderTree(
    sourceFolder.replace(/\/$/, ""),
  );

  for (const asset of assets) {
    if (asset.folderPath === targetFolder) continue;
    await moveMediaFile(asset.folderPath, targetFolder, asset.filename);
    await updateMediaAssetFolder(asset.id, targetFolder, linkedContentId);
  }

  const relocatedHero = rewriteUploadUrl(heroSrc, sourceFolder, targetFolder);
  const relocatedBody: ArticleBlock[] = body.map((block) => {
    if (block.type !== "image") return block;
    return {
      ...block,
      image: {
        ...block.image,
        src: rewriteUploadUrl(block.image.src, sourceFolder, targetFolder),
      },
    };
  });

  const changed =
    assets.length > 0 ||
    relocatedHero !== heroSrc ||
    relocatedBody.some((block, index) => block !== body[index]);

  return { heroSrc: relocatedHero, body: relocatedBody, changed };
}

export async function archiveMediaForContent(
  contentId: number,
  heroSrc: string,
  body: ArticleBlock[],
) {
  return relocateArticleMedia(contentId, "archived", heroSrc, body);
}

export async function restoreMediaForContent(
  contentId: number,
  heroSrc: string,
  body: ArticleBlock[],
) {
  return relocateArticleMedia(contentId, "active", heroSrc, body);
}
