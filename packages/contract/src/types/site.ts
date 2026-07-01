export type NavLink = {
  href: string;
  label: string;
};

export type NavSection = {
  id: string;
  label: string;
  href: string;
  children?: NavLink[];
};

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

export type ThemeMode = "light" | "dark";

export type TextDirection = "rtl" | "ltr";

export type ArticleBodyTypography = {
  justifyParagraphs: boolean;
};

export type SiteTypography = {
  articleBody: Record<TextDirection, ArticleBodyTypography>;
};

export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  logo: string;
  defaultTheme: ThemeMode;
  defaultDirection: TextDirection;
  typography: SiteTypography;
  navSections: NavSection[];
  utilityLinks: NavLink[];
  footerColumns: FooterColumn[];
  socialLinks: SocialLink[];
  hotTopics: string[];
  contactEmail: string;
  memberLabel: string;
  membersLabel: string;
};

export type CurrentContentGroupInfo = {
  number: number;
  season: string;
  year: number;
  label: string;
};
