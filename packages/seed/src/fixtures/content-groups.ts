import type {
  ContentGroup,
  ContentGroupSummary,
} from "@nextgen-cms/contract/types/content-group";
import { articles } from "./articles";

const contentGroupMeta: Array<{
  number: number;
  season: string;
  year: number;
  label: string;
  publishedAt: string;
  cover: { src: string; alt: string };
}> = [
  {
    number: 24,
    season: "بهار",
    year: 1405,
    label: "گروه محتوا ۲۴ — بهار ۱۴۰۵",
    publishedAt: "۱۴۰۵/۰۳/۳۱",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۴" },
  },
  {
    number: 23,
    season: "زمستان",
    year: 1404,
    label: "گروه محتوا ۲۳ — زمستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۱۲/۲۵",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۳" },
  },
  {
    number: 22,
    season: "پاییز",
    year: 1404,
    label: "گروه محتوا ۲۲ — پاییز ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۹/۳۰",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۲" },
  },
  {
    number: 21,
    season: "تابستان",
    year: 1404,
    label: "گروه محتوا ۲۱ — تابستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۶/۳۱",
    cover: { src: "/images/1.png", alt: "جلد گروه محتوا ۲۱" },
  },
];

export const contentGroups: ContentGroup[] = contentGroupMeta.map((meta) => {
  const groupArticles = articles
    .filter((article) => article.contentGroupNumber === meta.number)
    .map(({ body: _body, relatedSlugs: _related, ...preview }) => preview);

  return {
    ...meta,
    cover: meta.cover,
    articleCount: groupArticles.length,
    articles: groupArticles,
  };
});

const contentGroupMap = new Map(contentGroups.map((g) => [g.number, g]));

export function getContentGroups(): ContentGroupSummary[] {
  return contentGroups.map(({ articles: _articles, ...summary }) => summary);
}

export function getContentGroupByNumber(
  number: number,
): ContentGroup | undefined {
  return contentGroupMap.get(number);
}

export function getCurrentContentGroup(): ContentGroup {
  return contentGroups[0];
}
