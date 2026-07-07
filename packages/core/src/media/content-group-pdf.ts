const INVALID_FILENAME_CHARS = /[/\\:*?"<>|]/g;

export function sanitizePdfFilename(name: string): string {
  return name
    .replace(INVALID_FILENAME_CHARS, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildContentGroupPdfFilename(
  pageTitle: string,
  number: number,
  year: number,
): string {
  const title = sanitizePdfFilename(pageTitle.trim() || "گروه محتوا");
  const faNumber = number.toLocaleString("fa-IR");
  const faYear = year.toLocaleString("fa-IR");
  return sanitizePdfFilename(
    `${title} شماره ${faNumber} - سال ${faYear}.pdf`,
  );
}
