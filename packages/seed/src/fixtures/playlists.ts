import type { Playlist } from "@nextgen-cms/contract/types/article";

export const playlists: Playlist[] = [
  {
    slug: "geopolitics",
    name: "ژئوپلیتیک",
    description: "گفت‌وگوها و تحلیل‌های سیاست خارجی",
    cover: {
      src: "/images/video-america-iran.svg",
      alt: "کاور لیست پخش ژئوپلیتیک",
    },
  },
  {
    slug: "environment",
    name: "محیط زیست",
    description: "پرونده‌های محیط‌زیستی در قالب ویدیو",
    cover: {
      src: "/images/video-plastics.svg",
      alt: "کاور لیست پخش محیط زیست",
    },
  },
];
