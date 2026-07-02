import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveUploadsDir } from "@nextgen-cms/core/platform/paths";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function toDataUri(buffer: Buffer, ext: string): string {
  const mime = MIME_BY_EXT[ext.toLowerCase()] ?? "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function readUpload(relativePath: string): Promise<Buffer | null> {
  const uploadsDir = resolveUploadsDir();
  const nestedPath = path.join(uploadsDir, relativePath);

  try {
    return await readFile(nestedPath);
  } catch {
    const flatName = path.basename(relativePath);
    if (flatName === relativePath) return null;
    try {
      return await readFile(path.join(uploadsDir, flatName));
    } catch {
      return null;
    }
  }
}

export async function resolvePdfImageSrc(
  src: string,
  siteUrl: string,
): Promise<string> {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("/uploads/")) {
    const relative = src.slice("/uploads/".length);
    const buffer = await readUpload(relative);
    if (buffer) {
      const ext = path.extname(src) || ".jpg";
      return toDataUri(buffer, ext);
    }
  }

  if (src.startsWith("/")) {
    const publicCandidates = [
      path.join(process.cwd(), "public", src),
      path.join(process.cwd(), "apps/pelak/public", src),
    ];

    for (const publicPath of publicCandidates) {
      try {
        const buffer = await readFile(publicPath);
        const ext = path.extname(src) || ".jpg";
        return toDataUri(buffer, ext);
      } catch {
        // try next candidate
      }
    }
  }

  const base = siteUrl.replace(/\/$/, "");
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}

export function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3134";
}
