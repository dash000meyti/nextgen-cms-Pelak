/** Collapse whitespace while preserving single spaces between words. */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Extract plain text from an HTML subtree (strips tags). */
export function extractTextFromHtml(html: string): string {
  if (!html.trim()) return "";
  const withoutTags = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "");
  return collapseWhitespace(
    withoutTags
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'"),
  );
}
