import {
  DEFAULT_MEDIA_SETTINGS,
  DEFAULT_MODULE_SETTINGS,
  featureModulesToModuleSettings,
  moduleSettingsToFeatureModules,
  normalizeContentGroupModuleSettings,
  normalizeContentSettings,
  normalizeMemberSettings,
  normalizeModuleSettings,
  normalizeVideoModuleSettings,
} from "@nextgen-cms/config/theme/defaults";
import type {
  ContentGroupModuleSettings,
  ContentSettings,
  LegacyModuleSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
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

function parseLegacyModuleSettings(
  row: SiteSettingsRow,
): LegacyModuleSettings | null {
  return parseJson<LegacyModuleSettings>(row.moduleSettings);
}

export function mapSiteSettingsRow(row: SiteSettingsRow): SiteConfig {
  const memberSettings = mapMemberSettingsRow(row);
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
    memberLabel: memberSettings.memberLabel,
    membersLabel: memberSettings.membersLabel,
  };
}

export function mapFeatureModulesRow(row: SiteSettingsRow): FeatureModules {
  const moduleSettings = mapModuleSettingsRow(row);
  return moduleSettingsToFeatureModules(moduleSettings);
}

export function mapModuleSettingsRow(row: SiteSettingsRow): ModuleSettings {
  const stored = parseLegacyModuleSettings(row);
  if (stored) return normalizeModuleSettings(stored);
  const legacy = parseJson<FeatureModules>(row.featureModules);
  if (legacy) return featureModulesToModuleSettings(legacy);
  return DEFAULT_MODULE_SETTINGS;
}

export function mapContentGroupModuleSettingsRow(
  row: SiteSettingsRow,
): ContentGroupModuleSettings {
  const stored = parseJson<ContentGroupModuleSettings>(
    row.contentGroupModuleSettings,
  );
  return normalizeContentGroupModuleSettings(
    stored,
    parseLegacyModuleSettings(row),
  );
}

export function mapVideoModuleSettingsRow(
  row: SiteSettingsRow,
): VideoModuleSettings {
  const stored = parseJson<VideoModuleSettings>(row.videoModuleSettings);
  return normalizeVideoModuleSettings(stored, parseLegacyModuleSettings(row));
}

export function mapMediaSettingsRow(row: SiteSettingsRow): MediaSettings {
  return parseJson<MediaSettings>(row.mediaSettings) ?? DEFAULT_MEDIA_SETTINGS;
}

export function mapMemberSettingsRow(row: SiteSettingsRow): MemberSettings {
  return normalizeMemberSettings(parseJson<MemberSettings>(row.memberSettings));
}

export function mapContentSettingsRow(row: SiteSettingsRow): ContentSettings {
  return normalizeContentSettings(
    parseJson<ContentSettings>(row.contentSettings),
  );
}
