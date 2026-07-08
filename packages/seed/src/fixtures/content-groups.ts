import type {
  ContentGroup,
  ContentGroupSummary,
} from "@nextgen-cms/contract/types/content-group";
import { articles, type SeedArticle } from "./articles";

const contentGroupMeta: Array<{
  slug: string;
  title: string;
  publishedAt: string;
  cover: { src: string; alt: string };
}> = [
  {
    slug: "24",
    title: "گروه محتوا ۲۴ — بهار ۱۴۰۵",
    publishedAt: "۱۴۰۵/۰۳/۳۱",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۴" },
  },
  {
    slug: "23",
    title: "گروه محتوا ۲۳ — زمستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۱۲/۲۵",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۳" },
  },
  {
    slug: "22",
    title: "گروه محتوا ۲۲ — پاییز ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۹/۳۰",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۲" },
  },
  {
    slug: "21",
    title: "گروه محتوا ۲۱ — تابستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۶/۳۱",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۱" },
  },
];

function articleBelongsToGroup(article: SeedArticle, slug: string): boolean {
  return article.contentGroupSlugs.includes(slug);
}

export const contentGroups: ContentGroup[] = contentGroupMeta.map((meta) => {
  const groupArticles = articles
    .filter((article) => articleBelongsToGroup(article, meta.slug))
    .map(
      ({
        body: _body,
        relatedSlugs: _related,
        contentGroupSlugs: _slugs,
        ...preview
      }) => preview,
    );

  return {
    id: 0,
    slug: meta.slug,
    title: meta.title,
    status: "published" as const,
    cover: meta.cover,
    publishedAt: meta.publishedAt,
    articleCount: groupArticles.length,
    articles: groupArticles,
  };
});

const contentGroupMap = new Map(contentGroups.map((g) => [g.slug, g]));

export function getContentGroups(): ContentGroupSummary[] {
  return contentGroups.map(({ articles: _articles, ...summary }) => summary);
}

export function getContentGroupBySlug(slug: string): ContentGroup | undefined {
  return contentGroupMap.get(slug);
}

export function getCurrentContentGroup(): ContentGroup {
  return contentGroups[0];
}
