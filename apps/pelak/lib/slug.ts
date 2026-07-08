type SlugEntity = { slug: string };

export function decodeSlugSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizeSlugInput(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200f\u202a-\u202e]/g, " ")
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function encodeSlugSegment(value: string): string {
  return encodeURIComponent(value);
}

export function resolveSlugCandidates(rawSlug: string): string[] {
  const decoded = decodeSlugSegment(rawSlug).trim();
  const normalized = normalizeSlugInput(decoded);
  const rawTrimmed = rawSlug.trim();

  return [...new Set([normalized, decoded, rawTrimmed].filter(Boolean))];
}

export async function findBySlugCandidates<T extends SlugEntity>(
  rawSlug: string,
  lookup: (slug: string) => Promise<T | undefined>,
): Promise<{ entity: T | undefined; canonicalCandidate: string }> {
  const candidates = resolveSlugCandidates(rawSlug);
  for (const candidate of candidates) {
    const entity = await lookup(candidate);
    if (entity) {
      return { entity, canonicalCandidate: candidate };
    }
  }

  return {
    entity: undefined,
    canonicalCandidate: candidates[0] ?? normalizeSlugInput(rawSlug),
  };
}
