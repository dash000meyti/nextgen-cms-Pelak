import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import type { MediaAsset } from "@nextgen-cms/contract/types/media";
import { db } from "@nextgen-cms/core/db";
import {
  type MediaAssetInsert,
  type MediaAssetRow,
  mediaAssets,
} from "@nextgen-cms/core/db/schema";
import { resolveUploadPublicPath } from "@nextgen-cms/core/media/urls";
import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";

export type ListMediaAssetsOptions = {
  folderPath?: string;
  contentId?: number;
  includeDeleted?: boolean;
};

function mapRowToMediaAsset(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    uuid: row.uuid,
    filename: row.filename,
    originalName: row.originalName,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    folderPath: row.folderPath,
    publicUrl: resolveUploadPublicPath(row.folderPath, row.filename),
    uploadedByMemberId: row.uploadedByMemberId,
    contentId: row.contentId,
    createdAt: row.createdAt,
    metadata: row.metadata ?? {},
    deletedAt: row.deletedAt,
  };
}

export async function insertMediaAsset(
  input: MediaAssetInsert,
): Promise<MediaAsset> {
  const [row] = await db.insert(mediaAssets).values(input).returning();
  return mapRowToMediaAsset(row);
}

export async function getMediaAssetById(
  id: number,
): Promise<MediaAsset | null> {
  const [row] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);
  return row ? mapRowToMediaAsset(row) : null;
}

export async function getMediaAssetByUuid(
  uuid: string,
): Promise<MediaAsset | null> {
  const [row] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.uuid, uuid))
    .limit(1);
  return row ? mapRowToMediaAsset(row) : null;
}

export async function listMediaAssets(
  options: ListMediaAssetsOptions = {},
): Promise<MediaAsset[]> {
  const conditions = [];

  if (!options.includeDeleted) {
    conditions.push(isNull(mediaAssets.deletedAt));
  }

  if (options.contentId != null) {
    conditions.push(eq(mediaAssets.contentId, options.contentId));
  } else if (options.folderPath != null) {
    conditions.push(eq(mediaAssets.folderPath, options.folderPath));
  }

  const rows = await db
    .select()
    .from(mediaAssets)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(mediaAssets.createdAt));

  return rows.map(mapRowToMediaAsset);
}

export async function listMediaAssetsInFolder(
  folderPath: string,
): Promise<MediaAsset[]> {
  return listMediaAssets({
    folderPath: normalizeFolderPath(folderPath),
    includeDeleted: true,
  });
}

export async function listMediaAssetsInFolderTree(
  prefix: string,
): Promise<MediaAsset[]> {
  const normalized = prefix.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!normalized) return [];

  const exactPath = `${normalized}/`;
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(
      or(
        eq(mediaAssets.folderPath, exactPath),
        like(mediaAssets.folderPath, `${normalized}/%`),
      ),
    );

  return rows.map(mapRowToMediaAsset);
}

export async function listFolderPaths(
  parentPrefix?: string,
): Promise<string[]> {
  const prefix = parentPrefix?.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");

  const rows = await db
    .selectDistinct({ folderPath: mediaAssets.folderPath })
    .from(mediaAssets)
    .where(
      and(
        isNull(mediaAssets.deletedAt),
        prefix ? like(mediaAssets.folderPath, `${prefix}/%`) : sql`1 = 1`,
      ),
    );

  const childFolders = new Set<string>();

  for (const row of rows) {
    const folder = row.folderPath;
    if (!prefix) {
      const top = folder.split("/").filter(Boolean)[0];
      if (top) childFolders.add(`${top}/`);
      continue;
    }

    const remainder = folder.slice(prefix.length + 1);
    const next = remainder.split("/").filter(Boolean)[0];
    if (next) {
      childFolders.add(`${prefix}/${next}/`);
    }
  }

  return [...childFolders].sort((a, b) => a.localeCompare(b, "fa"));
}

export async function softDeleteMediaAsset(id: number): Promise<void> {
  await db
    .update(mediaAssets)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(mediaAssets.id, id));
}

export async function hardDeleteMediaAsset(id: number): Promise<void> {
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
}

export async function updateMediaAssetFolder(
  id: number,
  folderPath: string,
  contentId?: number | null,
): Promise<void> {
  await db
    .update(mediaAssets)
    .set({
      folderPath,
      ...(contentId !== undefined ? { contentId } : {}),
    })
    .where(eq(mediaAssets.id, id));
}

export async function updateMediaAssetFilename(
  id: number,
  filename: string,
  originalName?: string,
): Promise<void> {
  await db
    .update(mediaAssets)
    .set({
      filename,
      ...(originalName !== undefined ? { originalName } : {}),
    })
    .where(eq(mediaAssets.id, id));
}

export function buildPublicUrl(
  row: Pick<MediaAssetRow, "folderPath" | "filename">,
): string {
  return resolveUploadPublicPath(row.folderPath, row.filename);
}
