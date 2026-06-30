import type {
  CurrentContentGroupInfo,
  SiteConfig,
} from "@nextgen-cms/contract/types/site";

export const currentContentGroup: CurrentContentGroupInfo = {
  number: 24,
  season: "بهار",
  year: 1405,
  label: "گروه محتوا ۲۴ — بهار ۱۴۰۵",
};

export const siteConfig: SiteConfig = {
  name: "حکمران",
  tagline: "هفته‌نامه سیاسی-اقتصادی",
  description:
    "هفته‌نامه مستقل سیاسی و اقتصادی حکمران؛ تحلیل‌های راهبردی درباره حکمرانی، اقتصاد و نظم جهانی.",
  logo: "/images/hokmran-header2.png",
  defaultTheme: "dark",
  defaultDirection: "rtl",

  typography: {
    articleBody: {
      rtl: { justifyParagraphs: false },
      ltr: { justifyParagraphs: false },
    },
  },

  navSections: [
    {
      id: "content",
      label: "محتوا",
      href: "/content",
      children: [
        { href: "/topics/siasi", label: "سیاسی" },
        { href: "/topics/eghtesadi", label: "اقتصادی" },
        { href: "/topics/ejtemaei", label: "اجتماعی" },
        { href: "/topics/farhangi", label: "فرهنگی" },
        { href: "/topics/siasat-khareji", label: "سیاست خارجی" },
        { href: "/topics/amniyat", label: "امنیت" },
      ],
    },
    { id: "contentGroup", label: "هفته‌نامه", href: "/content-group" },
    { id: "video", label: "ویدیوها", href: "/video" },
  ],

  utilityLinks: [{ href: "/about", label: "ورود | عضویت" }],

  footerColumns: [
    {
      title: "درباره",
      links: [
        { href: "/about", label: "درباره ما" },
        { href: "/content-group", label: "گروه‌های محتوا" },
        { href: "/video", label: "ویدیوها" },
        { href: "/contact", label: "تماس با ما" },
      ],
    },
    {
      title: "ارتباط",
      links: [
        { href: "/contact", label: "سوالات متداول" },
        { href: "/contact", label: "تماس با ما" },
        { href: "/about", label: "درباره ما" },
      ],
    },
    {
      title: "کاوشگری",
      links: [
        { href: "/topics/siasi", label: "سیاسی" },
        { href: "/topics/eghtesadi", label: "اقتصادی" },
        { href: "/topics/siasat-khareji", label: "سیاست خارجی" },
        { href: "/topics/amniyat", label: "امنیت" },
      ],
    },
  ],

  socialLinks: [
    { id: "telegram", label: "تلگرام", href: "https://t.me/hokmran" },
    {
      id: "instagram",
      label: "اینستاگرام",
      href: "https://instagram.com/hokmran",
    },
    { id: "youtube", label: "یوتیوب", href: "https://youtube.com/@hokmran" },
    { id: "x", label: "ایکس", href: "https://x.com/hokmran" },
  ],

  hotTopics: ["ترامپ", "پوتین", "تحریم‌ها", "سوریه", "اقتصاد"],

  contactEmail: "info@hokmran.example",
};
