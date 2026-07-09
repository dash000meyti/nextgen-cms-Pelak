import { platformCache } from "@nextgen-cms/config/cache";
import { CACHE_TAGS } from "@nextgen-cms/config/constants";
import type {
  Article,
  ArticlePreview,
  Author,
  Playlist,
  Topic,
  Video,
} from "@nextgen-cms/contract/types/article";
import type { ContentGroup } from "@nextgen-cms/contract/types/content-group";
import {
  findAllArticlePreviews,
  findAllArticleSlugs,
  findArticleBySlug,
  findArticlesByAuthorSlug,
  findArticlesBySlugs,
  findArticlesByTopicSlug,
  findEditorsPicks,
  findFeaturedArticles,
  findPublishedArticleById,
  findPublishedArticleShareMetaBySlug,
  findPublishedArticleSitemapEntries,
} from "@nextgen-cms/core/db/repositories/articles";
import {
  findAllContentGroupSlugs,
  findAllContentGroupSummaries,
  findContentGroupById,
  findContentGroupBySlug,
  findCurrentContentGroup,
} from "@nextgen-cms/core/db/repositories/content-groups-public";
import {
  findAllPublicMemberSlugs,
  findAllPublicMembers,
  findPublicMemberBySlug,
} from "@nextgen-cms/core/db/repositories/members-public";
import { findMostRead } from "@nextgen-cms/core/db/repositories/most-read";
import {
  findAllPlaylistSlugs,
  findAllPlaylists,
  findPlaylistBySlug,
  findVideosByPlaylistSlug,
} from "@nextgen-cms/core/db/repositories/playlists";
import {
  findContentGroupModuleSettings,
  findContentSettings,
  findFeatureModules,
  findMediaSettings,
  findMemberSettings,
  findModuleSettings,
  findSiteConfig,
  findVideoModuleSettings,
} from "@nextgen-cms/core/db/repositories/site-config";
import { findThemeTokens } from "@nextgen-cms/core/db/repositories/theme";
import {
  findAllTopicSlugs,
  findAllTopics,
  findTopicBySlug,
} from "@nextgen-cms/core/db/repositories/topics";
import {
  findAllVideos,
  findVideoBySlug,
} from "@nextgen-cms/core/db/repositories/videos";

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

export const getContentGroupModuleSettings = platformCache(
  ["content-group-module-settings"],
  [CACHE_TAGS.siteConfig],
  findContentGroupModuleSettings,
);

export const getVideoModuleSettings = platformCache(
  ["video-module-settings"],
  [CACHE_TAGS.siteConfig],
  findVideoModuleSettings,
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

export const getPublishedArticleSitemapEntries = platformCache(
  ["article-sitemap-entries"],
  [CACHE_TAGS.articles],
  findPublishedArticleSitemapEntries,
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

export async function getPublishedArticleById(id: number) {
  return platformCache(
    ["article-by-id", String(id)],
    [CACHE_TAGS.articles],
    () => findPublishedArticleById(id),
  )();
}

export async function getArticleShareMetaBySlug(slug: string) {
  return platformCache(
    ["article-share-meta", slug],
    [CACHE_TAGS.articles, CACHE_TAGS.article(slug)],
    () => findPublishedArticleShareMetaBySlug(slug),
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
  const group = await getCurrentContentGroup();
  return group.articles.slice(0, limit);
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

/* ---------- Content groups ---------- */

export const getContentGroups = platformCache(
  ["content-groups-all"],
  [CACHE_TAGS.contentGroups],
  findAllContentGroupSummaries,
);

export const getAllContentGroupSlugs = platformCache(
  ["content-group-slugs"],
  [CACHE_TAGS.contentGroups],
  findAllContentGroupSlugs,
);

export async function getContentGroupBySlug(
  slug: string,
): Promise<ContentGroup | undefined> {
  return platformCache(
    ["content-group", slug],
    [CACHE_TAGS.contentGroups, CACHE_TAGS.contentGroup(slug)],
    () => findContentGroupBySlug(slug),
  )();
}

export async function getContentGroupById(
  id: number,
): Promise<ContentGroup | undefined> {
  return platformCache(
    ["content-group-by-id", String(id)],
    [CACHE_TAGS.contentGroups],
    () => findContentGroupById(id),
  )();
}

export const getCurrentContentGroup = platformCache(
  ["current-content-group"],
  [CACHE_TAGS.contentGroups],
  findCurrentContentGroup,
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

export type TopicWithArticles = {
  topic: Topic;
  articles: ArticlePreview[];
};

export async function getTopicsWithArticles(
  limitPerTopic = 7,
): Promise<TopicWithArticles[]> {
  const allTopics = await getTopics();
  const eligible = allTopics.filter((topic) => topic.showOnHomepage);
  const sections = await Promise.all(
    eligible.map(async (topic) => ({
      topic,
      articles: (await getArticlesByTopic(topic.slug)).slice(0, limitPerTopic),
    })),
  );
  return sections.filter((section) => section.articles.length > 0);
}

/* ---------- Videos ---------- */

export const getVideos = platformCache(
  ["videos-all"],
  [CACHE_TAGS.videos],
  findAllVideos,
);

export const getPlaylists = platformCache(
  ["playlists-all"],
  [CACHE_TAGS.playlists],
  findAllPlaylists,
);

export const getAllPlaylistSlugs = platformCache(
  ["playlist-slugs"],
  [CACHE_TAGS.playlists],
  findAllPlaylistSlugs,
);

export async function getPlaylistBySlug(
  slug: string,
): Promise<Playlist | undefined> {
  return platformCache(
    ["playlist", slug],
    [CACHE_TAGS.playlists, CACHE_TAGS.playlist(slug)],
    () => findPlaylistBySlug(slug),
  )();
}

export async function getVideosByPlaylist(slug: string): Promise<Video[]> {
  return platformCache(
    ["videos-by-playlist", slug],
    [CACHE_TAGS.videos, CACHE_TAGS.playlist(slug)],
    () => findVideosByPlaylistSlug(slug),
  )();
}

export async function getVideoBySlug(slug: string): Promise<Video | undefined> {
  return platformCache(
    ["video", slug],
    [CACHE_TAGS.videos, CACHE_TAGS.video(slug)],
    () => findVideoBySlug(slug),
  )();
}
