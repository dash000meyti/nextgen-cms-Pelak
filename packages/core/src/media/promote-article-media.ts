import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import {
  getMediaAssetByUuid,
  updateMediaAssetFolder,
} from "@nextgen-cms/core/db/repositories/media-assets";
import {
  type ContentMediaHome,
  contentMediaFolder,
} from "@nextgen-cms/core/media/content-media-lifecycle";
import { isSharedMediaPath } from "@nextgen-cms/core/media/path-policy";
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

export async function promoteArticleUploadUrl(
  contentId: number,
  publicUrl: string,
  mediaHome: ContentMediaHome = "active",
): Promise<string> {
  const parsed = parseUploadPublicUrl(publicUrl);
  if (!parsed?.filename) return publicUrl;

  const targetFolder = contentMediaFolder(contentId, mediaHome);
  if (parsed.folderPath === targetFolder) return publicUrl;

  const folderKey = parsed.folderPath.replace(/\/$/, "");
  if (isSharedMediaPath(folderKey) || isSharedMediaPath(parsed.folderPath)) {
    return publicUrl;
  }

  await moveMediaFile(parsed.folderPath, targetFolder, parsed.filename);

  const uuid = filenameUuid(parsed.filename);
  if (uuid) {
    const asset = await getMediaAssetByUuid(uuid);
    if (asset) {
      const linkedContentId = mediaHome === "active" ? contentId : null;
      await updateMediaAssetFolder(asset.id, targetFolder, linkedContentId);
    }
  }

  return resolveUploadPublicPath(targetFolder, parsed.filename);
}

export async function promoteArticleMedia(
  contentId: number,
  heroSrc: string,
  body: ArticleBlock[],
  mediaHome: ContentMediaHome = "active",
): Promise<{ heroSrc: string; body: ArticleBlock[]; changed: boolean }> {
  let changed = false;

  const promotedHero = await promoteArticleUploadUrl(
    contentId,
    heroSrc,
    mediaHome,
  );
  if (promotedHero !== heroSrc) changed = true;

  const promotedBody: ArticleBlock[] = [];
  for (const block of body) {
    if (block.type === "image") {
      const newSrc = await promoteArticleUploadUrl(
        contentId,
        block.image.src,
        mediaHome,
      );
      if (newSrc !== block.image.src) changed = true;
      promotedBody.push({
        ...block,
        image: { ...block.image, src: newSrc },
      });
    } else {
      promotedBody.push(block);
    }
  }

  return { heroSrc: promotedHero, body: promotedBody, changed };
}
