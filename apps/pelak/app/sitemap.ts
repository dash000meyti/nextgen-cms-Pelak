import {
  getAllAuthorSlugs,
  getAllPlaylistSlugs,
  getAllTopicSlugs,
  getContentGroups,
  getPublishedArticleSitemapEntries,
} from "@nextgen-cms/site-data/get-content";
import type { MetadataRoute } from "next";
import { encodeSlugSegment } from "@/lib/slug";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    articleEntries,
    authorSlugs,
    topicSlugs,
    playlistSlugs,
    contentGroups,
  ] = await Promise.all([
    getPublishedArticleSitemapEntries(),
    getAllAuthorSlugs(),
    getAllTopicSlugs(),
    getAllPlaylistSlugs(),
    getContentGroups(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/content",
    "/content-group",
    "/members",
    "/video",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const articleRoutes = articleEntries.map((entry) => ({
    url: `${baseUrl}/content/${encodeSlugSegment(entry.slug)}`,
    lastModified: entry.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const authorRoutes = authorSlugs.map((slug: string) => ({
    url: `${baseUrl}/members/${encodeSlugSegment(slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const topicRoutes = topicSlugs.map((slug: string) => ({
    url: `${baseUrl}/topics/${encodeSlugSegment(slug)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const playlistRoutes = playlistSlugs.map((slug: string) => ({
    url: `${baseUrl}/playlists/${encodeSlugSegment(slug)}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const contentGroupRoutes = contentGroups.map((group) => ({
    url: `${baseUrl}/content-group/${encodeSlugSegment(group.slug)}`,
    lastModified: group.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const contentGroupPdfRoutes = contentGroups
    .filter((group) => group.pdfSrc?.trim())
    .map((group) => ({
      url: `${baseUrl}${group.pdfSrc}`,
      lastModified: group.publishedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...authorRoutes,
    ...topicRoutes,
    ...playlistRoutes,
    ...contentGroupRoutes,
    ...contentGroupPdfRoutes,
  ];
}
