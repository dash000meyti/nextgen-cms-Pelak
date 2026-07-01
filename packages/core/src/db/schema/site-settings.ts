import type {
  ContentGroupModuleSettings,
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type {
  FooterColumn,
  NavLink,
  NavSection,
  SiteTypography,
  SocialLink,
  TextDirection,
  ThemeMode,
} from "@nextgen-cms/contract/types/site";
import type { FeatureModules } from "@nextgen-cms/contract/types/theme";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  logo: text("logo").notNull(),
  defaultTheme: text("default_theme").notNull().$type<ThemeMode>(),
  defaultDirection: text("default_direction").notNull().$type<TextDirection>(),
  typography: text("typography").notNull().$type<SiteTypography>(),
  navSections: text("nav_sections").notNull().$type<NavSection[]>(),
  utilityLinks: text("utility_links").notNull().$type<NavLink[]>(),
  footerColumns: text("footer_columns").notNull().$type<FooterColumn[]>(),
  socialLinks: text("social_links").notNull().$type<SocialLink[]>(),
  hotTopics: text("hot_topics").notNull().$type<string[]>(),
  contactEmail: text("contact_email").notNull(),
  featureModules: text("feature_modules").notNull().$type<FeatureModules>(),
  moduleSettings: text("module_settings").$type<ModuleSettings>(),
  contentGroupModuleSettings: text(
    "content_group_module_settings",
  ).$type<ContentGroupModuleSettings>(),
  videoModuleSettings: text(
    "video_module_settings",
  ).$type<VideoModuleSettings>(),
  mediaSettings: text("media_settings").$type<MediaSettings>(),
  memberSettings: text("member_settings").$type<MemberSettings>(),
  contentSettings: text("content_settings").$type<ContentSettings>(),
});

export type SiteSettingsRow = typeof siteSettings.$inferSelect;
