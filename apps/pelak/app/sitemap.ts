import {
  getAllArticleSlugs,
  getAllAuthorSlugs,
  getAllContentGroupNumbers,
  getAllTopicSlugs,
} from "@nextgen-cms/site-data/get-content";
import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hokmran.example";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articleSlugs, authorSlugs, topicSlugs, contentGroupNumbers] =
    await Promise.all([
      getAllArticleSlugs(),
      getAllAuthorSlugs(),
      getAllTopicSlugs(),
      getAllContentGroupNumbers(),
    ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/content",
    "/content-group",
    "/video",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const articleRoutes = articleSlugs.map((slug: string) => ({
    url: `${baseUrl}/content/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const authorRoutes = authorSlugs.map((slug: string) => ({
    url: `${baseUrl}/members/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const topicRoutes = topicSlugs.map((slug: string) => ({
    url: `${baseUrl}/topics/${slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const contentGroupRoutes = contentGroupNumbers.map((number: number) => ({
    url: `${baseUrl}/content-group/${number}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...articleRoutes,
    ...authorRoutes,
    ...topicRoutes,
    ...contentGroupRoutes,
  ];
}
