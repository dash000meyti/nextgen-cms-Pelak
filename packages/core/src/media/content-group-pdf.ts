const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;

export function sanitizePdfFilename(name: string): string {
  return name.replace(INVALID_FILENAME_CHARS, "").replace(/\s+/g, " ").trim();
}

export function buildContentGroupPdfFilename(
  title: string,
  slug: string,
): string {
  const safeTitle = sanitizePdfFilename(title.trim() || "گروه محتوا");
  const safeSlug = sanitizePdfFilename(slug.trim() || "content-group");
  return sanitizePdfFilename(`${safeTitle} - ${safeSlug}.pdf`);
}
