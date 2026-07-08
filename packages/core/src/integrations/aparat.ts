export function parseAparatHash(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  try {
    const url = new URL(value, "https://www.aparat.com");
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.endsWith("aparat.com") && !host.endsWith("aparat.ir")) {
      return null;
    }
    const segments = url.pathname.split("/").filter(Boolean);
    const vIndex = segments.indexOf("v");
    if (vIndex >= 0 && segments[vIndex + 1])
      return segments[vIndex + 1] ?? null;
    const hashIndex = segments.indexOf("videohash");
    if (hashIndex >= 0 && segments[hashIndex + 1]) {
      return segments[hashIndex + 1] ?? null;
    }
    const embedIndex = segments.indexOf("embed");
    if (embedIndex >= 0 && segments[embedIndex + 1]) {
      return segments[embedIndex + 1] ?? null;
    }
  } catch {
    // fall through to raw hash check
  }
  if (/^[a-zA-Z0-9_-]{5,}$/.test(value)) return value;
  return null;
}

export function buildAparatPageUrl(hash: string): string {
  return `https://www.aparat.com/v/${hash}`;
}

type AparatMetadata = {
  title: string;
  duration: string;
  bigPoster: string;
  pageUrl: string;
};

type LegacyAparatResponse = {
  video?: {
    title?: string;
    duration?: string | number;
    big_poster?: string;
    uid?: string;
  };
};

type V1AparatResponse = {
  data?: {
    attributes?: {
      title?: string;
      duration?: string | number;
      big_poster?: string;
      uid?: string;
    };
  };
};

function toDurationLabel(value: string | number | undefined): string {
  const durationSeconds =
    typeof value === "number" ? value : Number.parseInt(value ?? "", 10);
  const minutes = Number.isFinite(durationSeconds)
    ? Math.max(1, Math.round(durationSeconds / 60))
    : null;
  return minutes ? `${minutes.toLocaleString("fa-IR")} دقیقه` : "";
}

function mapLegacyPayload(
  hash: string,
  payload?: LegacyAparatResponse["video"],
) {
  if (!payload) return null;
  const uid = (payload.uid ?? hash).toString();
  return {
    title: (payload.title ?? "").trim(),
    duration: toDurationLabel(payload.duration),
    bigPoster: (payload.big_poster ?? "").trim(),
    pageUrl: buildAparatPageUrl(uid),
  } satisfies AparatMetadata;
}

function mapV1Payload(
  hash: string,
  payload?: V1AparatResponse["data"] extends infer D
    ? D extends { attributes?: infer A }
      ? A
      : never
    : never,
) {
  if (!payload) return null;
  const uid = (payload.uid ?? hash).toString();
  return {
    title: (payload.title ?? "").trim(),
    duration: toDurationLabel(payload.duration),
    bigPoster: (payload.big_poster ?? "").trim(),
    pageUrl: buildAparatPageUrl(uid),
  } satisfies AparatMetadata;
}

export async function fetchAparatVideoMetadata(
  input: string,
): Promise<AparatMetadata | null> {
  const hash = parseAparatHash(input);
  if (!hash) return null;
  const endpoints = [
    `https://www.aparat.com/etc/api/video/videohash/${encodeURIComponent(hash)}`,
    `https://www.aparat.com/api/fa/v1/video/video/show/videohash/${encodeURIComponent(hash)}?pr=1&mf=1`,
  ];
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) continue;
      const json = (await response.json()) as
        | LegacyAparatResponse
        | V1AparatResponse;
      if ("video" in json) {
        const mapped = mapLegacyPayload(hash, json.video);
        if (mapped) return mapped;
        continue;
      }
      if ("data" in json) {
        const mapped = mapV1Payload(hash, json.data?.attributes);
        if (mapped) return mapped;
      }
    } catch {
      // try next endpoint
    }
  }
  return null;
}
