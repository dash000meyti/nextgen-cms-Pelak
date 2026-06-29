import { moduleSettingsToFeatureModules } from "@nextgen-cms/config/theme/defaults";
import type {
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type { FeatureModules } from "@nextgen-cms/contract/types/theme";
import { db } from "@nextgen-cms/core/db";
import {
  mapContentSettingsRow,
  mapFeatureModulesRow,
  mapMediaSettingsRow,
  mapMemberSettingsRow,
  mapModuleSettingsRow,
  mapSiteSettingsRow,
} from "@nextgen-cms/core/db/mappers/site-config";
import { siteSettings } from "@nextgen-cms/core/db/schema";
import { eq } from "drizzle-orm";

async function getSiteSettingsRow() {
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Site settings not found. Run db:setup on first boot.");
  }
  return row;
}

export async function findSiteConfig() {
  return mapSiteSettingsRow(await getSiteSettingsRow());
}

export async function findFeatureModules() {
  return mapFeatureModulesRow(await getSiteSettingsRow());
}

export async function findModuleSettings() {
  return mapModuleSettingsRow(await getSiteSettingsRow());
}

export async function findMediaSettings() {
  return mapMediaSettingsRow(await getSiteSettingsRow());
}

export async function findMemberSettings() {
  return mapMemberSettingsRow(await getSiteSettingsRow());
}

export async function findContentSettings() {
  return mapContentSettingsRow(await getSiteSettingsRow());
}

export async function updateFeatureModules(modules: FeatureModules) {
  await updateModuleSettings({
    contentGroup: { enabled: modules.contentGroup, period: "seasonal" },
    video: {
      enabled: modules.video,
      pageTitle: "ویدیو",
      itemsPerPage: 12,
    },
    newsletter: { enabled: modules.newsletter },
  });
}

export async function updateModuleSettings(settings: ModuleSettings) {
  await db
    .update(siteSettings)
    .set({
      moduleSettings: settings,
      featureModules: moduleSettingsToFeatureModules(settings),
    })
    .where(eq(siteSettings.id, 1));
}

export async function updateMediaSettings(settings: MediaSettings) {
  await db
    .update(siteSettings)
    .set({ mediaSettings: settings })
    .where(eq(siteSettings.id, 1));
}

export async function updateMemberSettings(settings: MemberSettings) {
  await db
    .update(siteSettings)
    .set({ memberSettings: settings })
    .where(eq(siteSettings.id, 1));
}

export async function updateContentSettings(settings: ContentSettings) {
  await db
    .update(siteSettings)
    .set({ contentSettings: settings })
    .where(eq(siteSettings.id, 1));
}

export async function updateSiteSettings(data: Partial<SiteConfig>) {
  const payload: Partial<typeof siteSettings.$inferInsert> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.tagline !== undefined) payload.tagline = data.tagline;
  if (data.description !== undefined) payload.description = data.description;
  if (data.logo !== undefined) payload.logo = data.logo;
  if (data.defaultTheme !== undefined) payload.defaultTheme = data.defaultTheme;
  if (data.defaultDirection !== undefined) {
    payload.defaultDirection = data.defaultDirection;
  }
  if (data.typography !== undefined) payload.typography = data.typography;
  if (data.navSections !== undefined) payload.navSections = data.navSections;
  if (data.utilityLinks !== undefined) {
    payload.utilityLinks = data.utilityLinks;
  }
  if (data.footerColumns !== undefined) {
    payload.footerColumns = data.footerColumns;
  }
  if (data.socialLinks !== undefined) payload.socialLinks = data.socialLinks;
  if (data.hotTopics !== undefined) payload.hotTopics = data.hotTopics;
  if (data.contactEmail !== undefined) payload.contactEmail = data.contactEmail;

  if (Object.keys(payload).length === 0) return;

  await db.update(siteSettings).set(payload).where(eq(siteSettings.id, 1));
}
