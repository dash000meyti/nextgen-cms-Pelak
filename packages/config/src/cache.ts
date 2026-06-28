import { CACHE_TAGS } from "@nextgen-cms/config/constants";
import { unstable_cache, updateTag } from "next/cache";

export function platformCache<T>(
  keyParts: string[],
  tags: string[],
  fn: () => Promise<T>,
): () => Promise<T> {
  return unstable_cache(fn, keyParts, { tags });
}

export function invalidatePlatformConfig() {
  updateTag(CACHE_TAGS.siteConfig);
  updateTag(CACHE_TAGS.theme);
}

export function invalidateThemeConfig() {
  updateTag(CACHE_TAGS.theme);
}

export function invalidateSiteConfig() {
  updateTag(CACHE_TAGS.siteConfig);
}

export function invalidateArticles() {
  updateTag(CACHE_TAGS.articles);
}

export function invalidateArticle(slug: string) {
  updateTag(CACHE_TAGS.articles);
  updateTag(CACHE_TAGS.article(slug));
}

export function invalidateAuthors() {
  updateTag(CACHE_TAGS.authors);
}

export function invalidateAuthor(slug: string) {
  updateTag(CACHE_TAGS.authors);
  updateTag(CACHE_TAGS.author(slug));
}

export function invalidateMembers() {
  updateTag(CACHE_TAGS.members);
  updateTag(CACHE_TAGS.authors);
}

export function invalidateMember(slug: string) {
  updateTag(CACHE_TAGS.members);
  updateTag(CACHE_TAGS.member(slug));
  updateTag(CACHE_TAGS.authors);
  updateTag(CACHE_TAGS.author(slug));
}

export function invalidateTopics() {
  updateTag(CACHE_TAGS.topics);
}

export function invalidateTopic(slug: string) {
  updateTag(CACHE_TAGS.topics);
  updateTag(CACHE_TAGS.topic(slug));
}

export function invalidateIssues() {
  updateTag(CACHE_TAGS.issues);
}

export function invalidateIssue(number: number) {
  updateTag(CACHE_TAGS.issues);
  updateTag(CACHE_TAGS.issue(number));
}

export function invalidateVideos() {
  updateTag(CACHE_TAGS.videos);
}
