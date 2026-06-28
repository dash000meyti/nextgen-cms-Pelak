import type { Video } from "@nextgen-cms/contract/types/article";

export const videos: Video[] = [
  {
    slug: "america-iran-turmoil",
    title: "آمریکا، ایران و جهانی در آشوب",
    description: "گفت‌و‌گویی درباره وضعیت ژئوپلیتیک خاورمیانه و آینده نظم جهانی.",
    duration: "۶۳ دقیقه",
    thumbnail: {
      src: "/images/video-america-iran.svg",
      alt: "تصویر ویدیو گفت‌و‌گو",
    },
    publishedAt: "۱۴۰۵/۰۳/۲۵",
  },
  {
    slug: "ceasefire-stalemate",
    title: "وقتی آتش‌بس در واقع بن‌بست است",
    description:
      "تعادل با ایران بهترین چیزی است که آمریکا می‌تواند به دست آورد.",
    duration: "۲۲ دقیقه",
    thumbnail: {
      src: "/images/video-ceasefire.svg",
      alt: "تصویر ویدیو آتش‌بس",
    },
    publishedAt: "۱۴۰۵/۰۳/۱۸",
  },
  {
    slug: "plastics-crisis",
    title: "ظهور خاموش بحران پلاستیک",
    description: "چگونه با یک تهدید جهانی نامرئی مقابله کنیم؟",
    duration: "۱۸ دقیقه",
    thumbnail: {
      src: "/images/video-plastics.svg",
      alt: "تصویر ویدیو بحران پلاستیک",
    },
    publishedAt: "۱۴۰۵/۰۳/۱۰",
  },
];
