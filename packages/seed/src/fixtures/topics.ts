import type { Topic } from "@nextgen-cms/contract/types/article";

export const topics: Topic[] = [
  {
    slug: "siasi",
    name: "سیاسی",
    description: "تحلیل‌های سیاست داخلی، حکمرانی و نهادهای قدرت.",
  },
  {
    slug: "eghtesadi",
    name: "اقتصادی",
    description: "اقتصاد ایران و جهان، انرژی، تحریم‌ها و بازارها.",
  },
  {
    slug: "ejtemaei",
    name: "اجتماعی",
    description: "مسائل اجتماعی، فرهنگ عمومی و تحولات جامعه.",
  },
  {
    slug: "farhangi",
    name: "فرهنگی",
    description: "فرهنگ، اندیشه و تحولات نمادین جامعه.",
  },
  {
    slug: "siasat-khareji",
    name: "سیاست خارجی",
    description: "سیاست خارجی، ژئوپلیتیک و نظم جهانی.",
  },
  {
    slug: "amniyat",
    name: "امنیت",
    description: "امنیت ملی، دفاعی و استراتژیک.",
  },
];

const topicMap = new Map(topics.map((t) => [t.slug, t]));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topicMap.get(slug);
}

export function getTopics(): Topic[] {
  return topics;
}
