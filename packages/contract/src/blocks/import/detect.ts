import type { ImportFormat } from "./types";

const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/i;
const MARKDOWN_PATTERNS = [
  /^#{1,6}\s/m,
  /^>\s/m,
  /^[-*+]\s/m,
  /^\d+\.\s/m,
  /^```/m,
  /^\|.+\|/m,
  /^!\[[^\]]*\]\([^)]+\)/m,
];

export function detectImportFormat(input: string): ImportFormat {
  const trimmed = input.trim();
  if (!trimmed) return "plain";

  if (HTML_TAG_RE.test(trimmed)) {
    return "html";
  }

  for (const pattern of MARKDOWN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return "markdown";
    }
  }

  return "plain";
}
