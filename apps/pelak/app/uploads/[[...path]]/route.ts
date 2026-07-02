import { readFile } from "node:fs/promises";
import path from "node:path";
import { findArticleStatusById } from "@nextgen-cms/core/db/repositories/articles";
import {
  classifyUploadPath,
  isContentMediaPublic,
} from "@nextgen-cms/core/media/serve-access";
import { resolveUploadsDir } from "@nextgen-cms/core/platform/paths";
import { getMemberSession } from "@nextgen-cms/studio/admin/session";
import { NextResponse } from "next/server";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function isSafeRelativePath(relativePath: string): boolean {
  if (!relativePath || relativePath.startsWith("/")) return false;
  const segments = relativePath.split("/");
  return segments.every((segment) => segment.length > 0 && segment !== "..");
}

async function readUploadFile(relativePath: string): Promise<Buffer | null> {
  const ext = path.extname(relativePath).toLowerCase();
  if (!MIME_TYPES[ext]) return null;

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

async function canServeUpload(
  relativePath: string,
): Promise<{ allowed: boolean; isPublic: boolean }> {
  const decision = classifyUploadPath(relativePath);

  if (decision.access === "public") {
    return { allowed: true, isPublic: true };
  }

  if (decision.access === "private") {
    const session = await getMemberSession();
    return { allowed: session !== null, isPublic: false };
  }

  const status = await findArticleStatusById(decision.contentId);
  if (isContentMediaPublic(status)) {
    return { allowed: true, isPublic: true };
  }

  const session = await getMemberSession();
  return { allowed: session !== null, isPublic: false };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const relativePath = segments.join("/");
  if (!isSafeRelativePath(relativePath)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const ext = path.extname(relativePath).toLowerCase();
  const contentType = MIME_TYPES[ext];
  if (!contentType) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const access = await canServeUpload(relativePath);
  if (!access.allowed) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const data = await readUploadFile(relativePath);
  if (!data) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": access.isPublic
        ? "public, max-age=31536000, immutable"
        : "private, no-store",
    },
  });
}
