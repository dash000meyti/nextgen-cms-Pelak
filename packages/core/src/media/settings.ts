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

export async function getMaxImageBytes(): Promise<number> {
  const settings = await getMediaSettings();
  return settings.maxImageBytes;
}

export async function getMaxPdfBytes(): Promise<number> {
  const settings = await getMediaSettings();
  return settings.maxPdfBytes;
}

export async function resolveMaxBytesForMime(
  mimeType: string,
): Promise<number> {
  const settings = await getMediaSettings();
  if (mimeType === "application/pdf") return settings.maxPdfBytes;
  if (mimeType.startsWith("image/")) return settings.maxImageBytes;
  return settings.maxImageBytes;
}

export async function isMimeAllowed(mimeType: string): Promise<boolean> {
  const settings = await getMediaSettings();
  return settings.allowedMime.includes(mimeType);
}
