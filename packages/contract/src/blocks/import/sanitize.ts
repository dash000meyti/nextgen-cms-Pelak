const REMOVABLE_TAGS =
  /<\/?(?:style|script|meta|link|head|title|xml|w:|o:|v:|m:)[^>]*>/gi;

/** Strip Word/Office noise and dangerous tags before HTML parsing. */
export function sanitizeImportHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(REMOVABLE_TAGS, "")
    .replace(/<\/?(?:font|span)[^>]*>/gi, "")
    .replace(
      /\s(?:class|id|style|lang|dir|width|height|valign|align)="[^"]*"/gi,
      "",
    )
    .replace(
      /\s(?:class|id|style|lang|dir|width|height|valign|align)='[^']*'/gi,
      "",
    )
    .replace(/<o:p>\s*<\/o:p>/gi, "")
    .replace(/<o:p>/gi, "")
    .replace(/<\/o:p>/gi, "")
    .trim();
}
