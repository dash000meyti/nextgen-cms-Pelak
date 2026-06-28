import {
  DEFAULT_CONTENT_SETTINGS,
  DEFAULT_MEDIA_SETTINGS,
  DEFAULT_MEMBER_SETTINGS,
  DEFAULT_MODULE_SETTINGS,
  featureModulesToModuleSettings,
  moduleSettingsToFeatureModules,
} from "@nextgen-cms/config/theme/defaults";
import type {
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type { FeatureModules } from "@nextgen-cms/contract/types/theme";
import type { SiteSettingsRow } from "@nextgen-cms/core/db/schema/site-settings";

function parseJson<T>(value: T | string | null | undefined): T | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return JSON.parse(value) as T;
  }
  return value;
}

export function mapSiteSettingsRow(row: SiteSettingsRow): SiteConfig {
  return {
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    logo: row.logo,
    defaultTheme: row.defaultTheme,
    defaultDirection: row.defaultDirection,
    typography: parseJson(row.typography) ?? row.typography,
    navSections: parseJson(row.navSections) ?? row.navSections,
    utilityLinks: parseJson(row.utilityLinks) ?? row.utilityLinks,
    footerColumns: parseJson(row.footerColumns) ?? row.footerColumns,
    socialLinks: parseJson(row.socialLinks) ?? row.socialLinks,
    hotTopics: parseJson(row.hotTopics) ?? row.hotTopics,
    contactEmail: row.contactEmail,
  };
}

export function mapFeatureModulesRow(row: SiteSettingsRow): FeatureModules {
  const moduleSettings = mapModuleSettingsRow(row);
  return moduleSettingsToFeatureModules(moduleSettings);
}

export function mapModuleSettingsRow(row: SiteSettingsRow): ModuleSettings {
  const stored = parseJson<ModuleSettings>(row.moduleSettings);
  if (stored) return stored;
  const legacy = parseJson<FeatureModules>(row.featureModules);
  if (legacy) return featureModulesToModuleSettings(legacy);
  return DEFAULT_MODULE_SETTINGS;
}

export function mapMediaSettingsRow(row: SiteSettingsRow): MediaSettings {
  return parseJson<MediaSettings>(row.mediaSettings) ?? DEFAULT_MEDIA_SETTINGS;
}

export function mapMemberSettingsRow(row: SiteSettingsRow): MemberSettings {
  return (
    parseJson<MemberSettings>(row.memberSettings) ?? DEFAULT_MEMBER_SETTINGS
  );
}

export function mapContentSettingsRow(row: SiteSettingsRow): ContentSettings {
  return (
    parseJson<ContentSettings>(row.contentSettings) ?? DEFAULT_CONTENT_SETTINGS
  );
}
