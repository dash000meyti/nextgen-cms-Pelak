import type {
  SiteConfig,
  TextDirection,
} from "@nextgen-cms/contract/types/site";

export function articleParagraphClassName(
  siteConfig: SiteConfig,
  dir: TextDirection = siteConfig.defaultDirection,
): string {
  return siteConfig.typography.articleBody[dir].justifyParagraphs
    ? "text-justify"
    : "text-start";
}
