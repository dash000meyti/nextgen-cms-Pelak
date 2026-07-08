import type { Video } from "@nextgen-cms/contract/types/article";

export const videos: Video[] = [
  {
    slug: "america-iran-turmoil",
    title: "آمریکا، ایران و جهانی در آشوب",
    description: "گفت‌و‌گویی درباره وضعیت ژئوپلیتیک خاورمیانه و آینده نظم جهانی.",
    duration: "۶۳ دقیقه",
    status: "published",
    linkSource: "thumbnail",
    externalLink: "https://www.aparat.com",
    thumbnail: {
      src: "/images/video-america-iran.svg",
      alt: "تصویر ویدیو گفت‌و‌گو",
    },
    publishedAt: "۱۴۰۵/۰۳/۲۵",
    playlists: [],
  },
  {
    slug: "ceasefire-stalemate",
    title: "وقتی آتش‌بس در واقع بن‌بست است",
    description:
      "تعادل با ایران بهترین چیزی است که آمریکا می‌تواند به دست آورد.",
    duration: "۲۲ دقیقه",
    status: "published",
    linkSource: "thumbnail",
    externalLink: "https://www.aparat.com",
    thumbnail: {
      src: "/images/video-ceasefire.svg",
      alt: "تصویر ویدیو آتش‌بس",
    },
    publishedAt: "۱۴۰۵/۰۳/۱۸",
    playlists: [],
  },
  {
    slug: "plastics-crisis",
    title: "ظهور خاموش بحران پلاستیک",
    description: "چگونه با یک تهدید جهانی نامرئی مقابله کنیم؟",
    duration: "۱۸ دقیقه",
    status: "published",
    linkSource: "thumbnail",
    externalLink: "https://www.aparat.com",
    thumbnail: {
      src: "/images/video-plastics.svg",
      alt: "تصویر ویدیو بحران پلاستیک",
    },
    publishedAt: "۱۴۰۵/۰۳/۱۰",
    playlists: [],
  },
];
