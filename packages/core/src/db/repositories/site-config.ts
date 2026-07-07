import type { MessagesSettings } from "@nextgen-cms/contract/types/messages";
import type {
  ContentGroupModuleSettings,
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type { FeatureModules } from "@nextgen-cms/contract/types/theme";
import { db } from "@nextgen-cms/core/db";
import {
  mapContentGroupModuleSettingsRow,
  mapContentSettingsRow,
  mapFeatureModulesRow,
  mapMediaSettingsRow,
  mapMemberSettingsRow,
  mapMessagesSettingsRow,
  mapModuleSettingsRow,
  mapSiteSettingsRow,
  mapVideoModuleSettingsRow,
} from "@nextgen-cms/core/db/mappers/site-config";
import { siteSettings } from "@nextgen-cms/core/db/schema";
import { eq } from "drizzle-orm";

/** better-sqlite3 bind fails on nested JSON objects — store as string */
function jsonColumn<T>(value: T): T {
  return JSON.stringify(value) as T;
}

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

export async function findMessagesSettings() {
  return mapMessagesSettingsRow(await getSiteSettingsRow());
}

export async function findContentGroupModuleSettings() {
  return mapContentGroupModuleSettingsRow(await getSiteSettingsRow());
}

export async function findVideoModuleSettings() {
  return mapVideoModuleSettingsRow(await getSiteSettingsRow());
}

/** @deprecated Use updateModuleSettings */
export async function updateFeatureModules(modules: FeatureModules) {
  await updateModuleSettings({
    contentGroup: { enabled: modules.contentGroup },
    video: { enabled: modules.video },
    newsletter: { enabled: modules.newsletter },
  });
}

export async function updateModuleSettings(settings: ModuleSettings) {
  await db
    .update(siteSettings)
    .set({ moduleSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateContentGroupModuleSettings(
  settings: ContentGroupModuleSettings,
) {
  await db
    .update(siteSettings)
    .set({ contentGroupModuleSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateVideoModuleSettings(settings: VideoModuleSettings) {
  await db
    .update(siteSettings)
    .set({ videoModuleSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateMediaSettings(settings: MediaSettings) {
  await db
    .update(siteSettings)
    .set({ mediaSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateMemberSettings(settings: MemberSettings) {
  await db
    .update(siteSettings)
    .set({ memberSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateContentSettings(settings: ContentSettings) {
  await db
    .update(siteSettings)
    .set({ contentSettings: jsonColumn(settings) })
    .where(eq(siteSettings.id, 1));
}

export async function updateMessagesSettings(settings: MessagesSettings) {
  await db
    .update(siteSettings)
    .set({ messagesSettings: jsonColumn(settings) })
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
  if (data.typography !== undefined)
    payload.typography = jsonColumn(data.typography);
  if (data.navSections !== undefined)
    payload.navSections = jsonColumn(data.navSections);
  if (data.utilityLinks !== undefined) {
    payload.utilityLinks = jsonColumn(data.utilityLinks);
  }
  if (data.footerColumns !== undefined) {
    payload.footerColumns = jsonColumn(data.footerColumns);
  }
  if (data.socialLinks !== undefined)
    payload.socialLinks = jsonColumn(data.socialLinks);
  if (data.hotTopics !== undefined)
    payload.hotTopics = jsonColumn(data.hotTopics);
  if (data.contactEmail !== undefined) payload.contactEmail = data.contactEmail;

  if (Object.keys(payload).length === 0) return;

  await db.update(siteSettings).set(payload).where(eq(siteSettings.id, 1));
}
