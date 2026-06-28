export const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/svg+xml", "svg"],
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_LABELS = "JPEG, PNG, WebP, SVG";

export function getExtensionForMimeType(mimeType: string): string | undefined {
  return ALLOWED_MIME_TYPES.get(mimeType);
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
