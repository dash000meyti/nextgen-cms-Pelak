import { DEFAULT_MEDIA_SETTINGS } from "@nextgen-cms/config/theme/defaults";
import type { MediaSettings } from "@nextgen-cms/contract/types/modules";
import { findMediaSettings } from "@nextgen-cms/core/db/repositories/site-config";

let cached: MediaSettings | null = null;

export async function getMediaSettings(): Promise<MediaSettings> {
  if (cached) return cached;
  try {
    cached = await findMediaSettings();
    return cached;
  } catch {
    return DEFAULT_MEDIA_SETTINGS;
  }
}

export function clearMediaSettingsCache() {
  cached = null;
}

export async function getMaxUploadBytes(): Promise<number> {
  const settings = await getMediaSettings();
  return settings.maxBytes;
}

export async function isMimeAllowed(mimeType: string): Promise<boolean> {
  const settings = await getMediaSettings();
  return settings.allowedMime.includes(mimeType);
}
