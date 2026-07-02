"use server";

import {
  invalidatePlatformConfig,
  invalidateSiteConfig,
  invalidateThemeConfig,
} from "@nextgen-cms/config/cache";
import {
  normalizeContentGroupModuleSettings,
  normalizeContentSettings,
  normalizeMemberSettings,
  normalizeModuleSettings,
  normalizeVideoModuleSettings,
} from "@nextgen-cms/config/theme/defaults";
import type {
  ContentGroupModuleSettings,
  ContentSettings,
  MediaSettings,
  MemberSettings,
  ModuleSettings,
  VideoModuleSettings,
} from "@nextgen-cms/contract/types/modules";
import type { SiteConfig } from "@nextgen-cms/contract/types/site";
import type { ThemeTokens } from "@nextgen-cms/contract/types/theme";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import {
  updateContentGroupModuleSettings,
  updateContentSettings,
  updateMediaSettings,
  updateMemberSettings,
  updateModuleSettings,
  updateSiteSettings,
  updateVideoModuleSettings,
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

export async function saveModuleSettings(data: ModuleSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.modules");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateModuleSettings(normalizeModuleSettings(data));
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveContentGroupModuleSettings(
  data: ContentGroupModuleSettings,
) {
  const sessionOrDenied = await requirePermissionMutation(
    "modules.contentGroup.edit",
  );
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateContentGroupModuleSettings(
      normalizeContentGroupModuleSettings(data),
    );
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveVideoModuleSettings(data: VideoModuleSettings) {
  const sessionOrDenied = await requirePermissionMutation("modules.video.edit");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateVideoModuleSettings(normalizeVideoModuleSettings(data));
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
    await updateMemberSettings(normalizeMemberSettings(data));
    invalidateSiteConfig();
  } catch (error) {
    return handleMutationError(error);
  }
}

export async function saveContentSettings(data: ContentSettings) {
  const sessionOrDenied = await requirePermissionMutation("settings.content");
  if ("ok" in sessionOrDenied && !sessionOrDenied.ok) return sessionOrDenied;

  try {
    await updateContentSettings(normalizeContentSettings(data));
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
