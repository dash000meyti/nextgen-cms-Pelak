import { platformCache } from "@nextgen-cms/config/cache";
import { CACHE_TAGS } from "@nextgen-cms/config/constants";
import type {
  Article,
  ArticlePreview,
  Author,
  Topic,
} from "@nextgen-cms/contract/types/article";
import type { Issue } from "@nextgen-cms/contract/types/issue";
import {
  findAllArticlePreviews,
  findAllArticleSlugs,
  findArticleBySlug,
  findArticlesByAuthorSlug,
  findArticlesByIssueNumber,
  findArticlesBySlugs,
  findArticlesByTopicSlug,
  findEditorsPicks,
  findFeaturedArticles,
} from "@nextgen-cms/core/db/repositories/articles";
import {
  findAllIssueNumbers,
  findAllIssueSummaries,
  findCurrentIssue,
  findIssueByNumber,
} from "@nextgen-cms/core/db/repositories/issues-authors";
import {
  findAllPublicMemberSlugs,
  findAllPublicMembers,
  findPublicMemberBySlug,
} from "@nextgen-cms/core/db/repositories/members-public";
import { findMostRead } from "@nextgen-cms/core/db/repositories/most-read";
import {
  findContentSettings,
  findFeatureModules,
  findMediaSettings,
  findMemberSettings,
  findModuleSettings,
  findSiteConfig,
} from "@nextgen-cms/core/db/repositories/site-config";
import { findThemeTokens } from "@nextgen-cms/core/db/repositories/theme";
import {
  findAllTopicSlugs,
  findAllTopics,
  findTopicBySlug,
} from "@nextgen-cms/core/db/repositories/topics";
import { findAllVideos } from "@nextgen-cms/core/db/repositories/videos";

/* ---------- Site config ---------- */

export const getSiteConfig = platformCache(
  ["site-config"],
  [CACHE_TAGS.siteConfig],
  findSiteConfig,
);

export const getThemeTokens = platformCache(
  ["theme-tokens"],
  [CACHE_TAGS.theme],
  findThemeTokens,
);

export const getFeatureModules = platformCache(
  ["feature-modules"],
  [CACHE_TAGS.siteConfig],
  findFeatureModules,
);

export const getModuleSettings = platformCache(
  ["module-settings"],
  [CACHE_TAGS.siteConfig],
  findModuleSettings,
);

export const getMediaSettings = platformCache(
  ["media-settings"],
  [CACHE_TAGS.siteConfig],
  findMediaSettings,
);

export const getMemberSettings = platformCache(
  ["member-settings"],
  [CACHE_TAGS.siteConfig],
  findMemberSettings,
);

export const getContentSettings = platformCache(
  ["content-settings"],
  [CACHE_TAGS.siteConfig],
  findContentSettings,
);

/* ---------- Articles ---------- */

export const getArticles = platformCache(
  ["articles-all"],
  [CACHE_TAGS.articles],
  findAllArticlePreviews,
);

export const getAllArticleSlugs = platformCache(
  ["article-slugs"],
  [CACHE_TAGS.articles],
  findAllArticleSlugs,
);

export async function getArticleBySlug(
  slug: string,
): Promise<Article | undefined> {
  return platformCache(
    ["article", slug],
    [CACHE_TAGS.articles, CACHE_TAGS.article(slug)],
    () => findArticleBySlug(slug),
  )();
}

export async function getArticlesByTopic(
  topicSlug: string,
): Promise<ArticlePreview[]> {
  return platformCache(
    ["articles-by-topic", topicSlug],
    [CACHE_TAGS.articles, CACHE_TAGS.topic(topicSlug)],
    () => findArticlesByTopicSlug(topicSlug),
  )();
}

export async function getFeaturedArticles(
  limit = 1,
): Promise<ArticlePreview[]> {
  return platformCache(
    ["featured-articles", String(limit)],
    [CACHE_TAGS.articles],
    () => findFeaturedArticles(limit),
  )();
}

export async function getEditorsPicks(limit = 3): Promise<ArticlePreview[]> {
  return platformCache(
    ["editors-picks", String(limit)],
    [CACHE_TAGS.articles],
    () => findEditorsPicks(limit),
  )();
}

export async function getLeadEssays(limit = 3): Promise<ArticlePreview[]> {
  const issue = await getCurrentIssue();
  const essays = await platformCache(
    ["articles-by-issue", String(issue.number)],
    [CACHE_TAGS.articles, CACHE_TAGS.issue(issue.number)],
    () => findArticlesByIssueNumber(issue.number),
  )();
  return essays.slice(0, limit);
}

export async function getRelatedArticles(
  slug: string,
  limit = 3,
): Promise<ArticlePreview[]> {
  const article = await getArticleBySlug(slug);
  if (!article) return [];

  const related = (await findArticlesBySlugs(article.relatedSlugs)).slice(
    0,
    limit,
  );

  if (related.length >= limit) return related;

  const all = await getArticles();
  const fallback = all
    .filter(
      (item) =>
        item.slug !== slug &&
        !article.relatedSlugs.includes(item.slug) &&
        item.topics.some((topic) =>
          article.topics.some((t) => t.slug === topic.slug),
        ),
    )
    .slice(0, limit - related.length);

  return [...related, ...fallback].slice(0, limit);
}

export async function getMostRead(limit = 10): Promise<ArticlePreview[]> {
  return platformCache(
    ["most-read", String(limit)],
    [CACHE_TAGS.articles],
    () => findMostRead(limit),
  )();
}

/* ---------- Issues ---------- */

export const getIssues = platformCache(
  ["issues-all"],
  [CACHE_TAGS.issues],
  findAllIssueSummaries,
);

export const getAllIssueNumbers = platformCache(
  ["issue-numbers"],
  [CACHE_TAGS.issues],
  findAllIssueNumbers,
);

export async function getIssueByNumber(
  number: number,
): Promise<Issue | undefined> {
  return platformCache(
    ["issue", String(number)],
    [CACHE_TAGS.issues, CACHE_TAGS.issue(number)],
    () => findIssueByNumber(number),
  )();
}

export const getCurrentIssue = platformCache(
  ["current-issue"],
  [CACHE_TAGS.issues],
  findCurrentIssue,
);

/* ---------- Members (public profiles) ---------- */

export const getMembers = platformCache(
  ["members-all"],
  [CACHE_TAGS.members],
  findAllPublicMembers,
);

export const getAllMemberSlugs = platformCache(
  ["member-slugs"],
  [CACHE_TAGS.members],
  findAllPublicMemberSlugs,
);

export async function getMemberBySlug(
  slug: string,
): Promise<Author | undefined> {
  return platformCache(
    ["member", slug],
    [CACHE_TAGS.members, CACHE_TAGS.member(slug)],
    () => findPublicMemberBySlug(slug),
  )();
}

export async function getArticlesByMember(
  memberSlug: string,
): Promise<ArticlePreview[]> {
  return platformCache(
    ["articles-by-member", memberSlug],
    [CACHE_TAGS.articles, CACHE_TAGS.member(memberSlug)],
    () => findArticlesByAuthorSlug(memberSlug),
  )();
}

/* ---------- Authors (deprecated aliases) ---------- */

export const getAuthors = getMembers;

export const getAllAuthorSlugs = getAllMemberSlugs;

export async function getAuthorBySlug(
  slug: string,
): Promise<Author | undefined> {
  return getMemberBySlug(slug);
}

export async function getArticlesByAuthor(
  authorSlug: string,
): Promise<ArticlePreview[]> {
  return getArticlesByMember(authorSlug);
}

/* ---------- Topics ---------- */

export const getTopics = platformCache(
  ["topics-all"],
  [CACHE_TAGS.topics],
  findAllTopics,
);

export const getAllTopicSlugs = platformCache(
  ["topic-slugs"],
  [CACHE_TAGS.topics],
  findAllTopicSlugs,
);

export async function getTopicBySlug(slug: string): Promise<Topic | undefined> {
  return platformCache(
    ["topic", slug],
    [CACHE_TAGS.topics, CACHE_TAGS.topic(slug)],
    () => findTopicBySlug(slug),
  )();
}

/* ---------- Videos ---------- */

export const getVideos = platformCache(
  ["videos-all"],
  [CACHE_TAGS.videos],
  findAllVideos,
);
