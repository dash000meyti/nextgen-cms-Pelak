import type { Author } from "@nextgen-cms/contract/types/article";

export const authors: Author[] = [
  {
    slug: "mohammad-shirkound",
    name: "محمد شیرکوند",
    role: "تحلیل‌گر سیاسی",
    bio: "تحلیل‌گر مسائل سیاسی و حکمرانی؛ متن‌های او به خوانش بحران‌های قدرت و نظم داخلی می‌پردازد.",
    avatar: {
      src: "/images/avatar-shirkound.svg",
      alt: "تصویر محمد شیرکوند",
    },
    social: { telegram: "https://t.me/shirkound" },
    articleCount: 4,
  },
  {
    slug: "yaser-jebraeili",
    name: "سید یاسر جبرائیلی",
    role: "پژوهشگر راهبردی",
    bio: "پژوهشگر حوزه راهبرد و امنیت اقتصادی؛ تمرکز او بر معماری قدرت ملی و امنیت پایدار است.",
    avatar: {
      src: "/images/avatar-jebraeili.svg",
      alt: "تصویر سید یاسر جبرائیلی",
    },
    social: { telegram: "https://t.me/jebraeili" },
    articleCount: 3,
  },
  {
    slug: "tahririye",
    name: "تحریریه حکمران",
    role: "تحریریه",
    bio: "تحریریه هفته‌نامه حکمران؛ گردآورنده گزارش‌ها و یادداشت‌های تحلیلی پایگاه.",
    avatar: {
      src: "/images/avatar-tahririye.svg",
      alt: "نشان تحریریه حکمران",
    },
    articleCount: 5,
  },
  {
    slug: "sasan-zarezade",
    name: "ساسان زارع‌زاده",
    role: "تحلیل‌گر روابط بین‌الملل",
    bio: "تحلیل‌گر نظم جهانی و سیاست خارجی قدرت‌های بزرگ.",
    avatar: {
      src: "/images/avatar-zarezade.svg",
      alt: "تصویر ساسان زارع‌زاده",
    },
    articleCount: 2,
  },
  {
    slug: "thomas-graham",
    name: "توماس گراهام",
    role: "عضو ارشد شورای روابط خارجی",
    bio: "عضو ارشد شورای روابط خارجی آمریکا؛ پژوهشگر روابط آمریکا و روسیه.",
    avatar: {
      src: "/images/avatar-graham.svg",
      alt: "تصویر توماس گراهام",
    },
    articleCount: 1,
  },
  {
    slug: "amy-jaffe",
    name: "امی مایرز جف",
    role: "استاد پژوهشی سیاست اقلیم",
    bio: "استاد پژوهشی و مدیر آزمایشگاه سیاست اقلیم در مدرسه فلچر.",
    avatar: {
      src: "/images/avatar-jaffe.svg",
      alt: "تصویر امی مایرز جف",
    },
    articleCount: 1,
  },
];

const authorMap = new Map(authors.map((a) => [a.slug, a]));

export function getAuthors(): Author[] {
  return authors;
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return authorMap.get(slug);
}
