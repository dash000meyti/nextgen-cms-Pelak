import type { ArticleBlock } from "@nextgen-cms/contract/types/article";
import { contentPath } from "@nextgen-cms/core/media/path-policy";
import { promoteMediaToFolder } from "@nextgen-cms/core/media/promote-media";

export async function promoteArticleUploadUrl(
  contentId: number,
  publicUrl: string,
): Promise<string> {
  return promoteMediaToFolder(publicUrl, contentPath(contentId), {
    contentId,
  });
}

export async function promoteArticleMedia(
  contentId: number,
  heroSrc: string,
  body: ArticleBlock[],
): Promise<{ heroSrc: string; body: ArticleBlock[]; changed: boolean }> {
  let changed = false;

  const promotedHero = await promoteArticleUploadUrl(contentId, heroSrc);
  if (promotedHero !== heroSrc) changed = true;

  const promotedBody: ArticleBlock[] = [];
  for (const block of body) {
    if (block.type === "image") {
      const newSrc = await promoteArticleUploadUrl(contentId, block.image.src);
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
