import type { Topic } from "@nextgen-cms/contract/types/article";

export const topics: Topic[] = [
  {
    slug: "siasi",
    name: "سیاسی",
    description: "تحلیل‌های سیاست داخلی، حکمرانی و نهادهای قدرت.",
    showOnHomepage: true,
  },
  {
    slug: "eghtesadi",
    name: "اقتصادی",
    description: "اقتصاد ایران و جهان، انرژی، تحریم‌ها و بازارها.",
    showOnHomepage: true,
  },
  {
    slug: "ejtemaei",
    name: "اجتماعی",
    description: "مسائل اجتماعی، فرهنگ عمومی و تحولات جامعه.",
    showOnHomepage: true,
  },
  {
    slug: "farhangi",
    name: "فرهنگی",
    description: "فرهنگ، اندیشه و تحولات نمادین جامعه.",
    showOnHomepage: true,
  },
  {
    slug: "siasat-khareji",
    name: "سیاست خارجی",
    description: "سیاست خارجی، ژئوپلیتیک و نظم جهانی.",
    showOnHomepage: true,
  },
  {
    slug: "amniyat",
    name: "امنیت",
    description: "امنیت ملی، دفاعی و استراتژیک.",
    showOnHomepage: true,
  },
];

const topicMap = new Map(topics.map((t) => [t.slug, t]));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topicMap.get(slug);
}

export function getTopics(): Topic[] {
  return topics;
}
