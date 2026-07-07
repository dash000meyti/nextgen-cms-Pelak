/**
 * Parses an Aparat URL or embed code and returns the video hash.
 * Accepts shapes like:
 *   https://www.aparat.com/v/XXXX
 *   https://www.aparat.com/video/video/embed/videohash/XXXX
 *   https://www.aparat.com/embed/XXXX
 *   a raw hash XXXX
 * Returns null when no hash can be extracted.
 */
export function parseAparatHash(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value, "https://www.aparat.com");
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "aparat.com") {
      return null;
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const vIndex = segments.indexOf("v");
    if (vIndex >= 0 && segments[vIndex + 1]) {
      return segments[vIndex + 1] ?? null;
    }
    const hashIndex = segments.indexOf("videohash");
    if (hashIndex >= 0 && segments[hashIndex + 1]) {
      return segments[hashIndex + 1] ?? null;
    }
    const embedIndex = segments.indexOf("embed");
    if (embedIndex >= 0 && segments[embedIndex + 1]) {
      return segments[embedIndex + 1] ?? null;
    }
  } catch {
    // not a URL — fall through to raw-hash check
  }

  if (/^[a-zA-Z0-9_-]{6,}$/.test(value)) {
    return value;
  }
  return null;
}

export function buildAparatEmbedUrl(hash: string): string {
  return `https://www.aparat.com/video/video/embed/videohash/${hash}`;
}

export function buildAparatEmbedSrc(input: string): string | null {
  const hash = parseAparatHash(input);
  if (!hash) return null;
  return buildAparatEmbedUrl(hash);
}
