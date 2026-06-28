"use server";

import {
  invalidatePlatformConfig,
  invalidateSiteConfig,
  invalidateThemeConfig,
} from "@nextgen-cms/config/cache";
import type {
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type {
  FeatureModules,
  ThemeTokens,
} from "@nextgen-cms/contract/types/theme";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  updateContentSettings,
  updateFeatureModules,
  updateMediaSettings,
  updateMemberSettings,
  updateModuleSettings,
  updateSiteSettings,
} from "@nextgen-cms/core/db/repositories/site-config";
import { updateThemeTokens } from "@nextgen-cms/core/db/repositories/theme";
import { clearMediaSettingsCache } from "@nextgen-cms/core/media/settings";
import { permissionDeniedResult } from "@nextgen-cms/studio/admin/article-access";
import { requirePermissionMutation } from "@nextgen-cms/studio/admin/require-permission";
import type { MutationResult } from "@nextgen-cms/studio/cms/mutations/require-admin";

function handleMutationError(error: unknown): MutationResult {
  if (error instanceof PermissionDeniedError) {
    return permissionDeniedResult();
  }
  throw error;
}

export async function saveThemeTokens(data: ThemeTokens) {
  const sessionOrDenied = await requirePermissionMutation("settings.theme");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateThemeTokens(data);
    invalidateThemeConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveFeatureModules(data: FeatureModules) {
  const sessionOrDenied = await requirePermissionMutation("settings.modules");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateFeatureModules(data);
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveModuleSettings(data: ModuleSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.modules");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateModuleSettings(data);
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveMediaSettings(data: MediaSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.media");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateMediaSettings(data);
    clearMediaSettingsCache();
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveMemberSettings(data: MemberSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.members");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateMemberSettings(data);
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveContentSettings(data: ContentSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateContentSettings(data);
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveSiteSettings(data: Partial<SiteConfig>) {
  const sessionOrDenied = await requirePermissionMutation("settings.site");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateSiteSettings(data);
    invalidatePlatformConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}
