import type { Issue, IssueSummary } from "@nextgen-cms/contract/types/issue";
import { articles } from "./articles";

const issueMeta: Array<{
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
    label: "شماره ۲۴ — بهار ۱۴۰۵",
    publishedAt: "۱۴۰۵/۰۳/۳۱",
    cover: { src: "/images/1.png", alt: "جلد شماره ۲۴" },
  },
  {
    number: 23,
    season: "زمستان",
    year: 1404,
    label: "شماره ۲۳ — زمستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۱۲/۲۵",
    cover: { src: "/images/1.png", alt: "جلد شماره ۲۳" },
  },
  {
    number: 22,
    season: "پاییز",
    year: 1404,
    label: "شماره ۲۲ — پاییز ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۹/۳۰",
    cover: { src: "/images/1.png", alt: "جلد شماره ۲۲" },
  },
  {
    number: 21,
    season: "تابستان",
    year: 1404,
    label: "شماره ۲۱ — تابستان ۱۴۰۴",
    publishedAt: "۱۴۰۴/۰۶/۳۱",
    cover: { src: "/images/1.png", alt: "جلد شماره ۲۱" },
  },
];

export const issues: Issue[] = issueMeta.map((meta) => {
  const issueArticles = articles
    .filter((article) => article.issueNumber === meta.number)
    .map(({ body: _body, relatedSlugs: _related, ...preview }) => preview);

  return {
    ...meta,
    cover: meta.cover,
    articleCount: issueArticles.length,
    articles: issueArticles,
  };
});

const issueMap = new Map(issues.map((i) => [i.number, i]));

export function getIssues(): IssueSummary[] {
  return issues.map(({ articles: _articles, ...summary }) => summary);
}

export function getIssueByNumber(number: number): Issue | undefined {
  return issueMap.get(number);
}

export function getCurrentIssue(): Issue {
  return issues[0];
}
