import { db } from "@nextgen-cms/core/db";
import { assertMemberPermission } from "@nextgen-cms/core/db/access/assert-permission";
import { PermissionDeniedError } from "@nextgen-cms/core/db/access/permission-denied-error";
import type { AdminAccess } from "@nextgen-cms/core/db/access/types";
import { videos } from "@nextgen-cms/core/db/schema";
import { videoPath } from "@nextgen-cms/core/media/path-policy";
import { purgeMediaFolder } from "@nextgen-cms/core/media/purge-folder";
import { and, eq, ne } from "drizzle-orm";

export type VideoWriteInput = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  publishedAt: string;
};

export async function findVideoById(id: number, access?: AdminAccess) {
  if (access) {
    try {
      await assertMemberPermission(access.memberId, "modules.video.view");
    } catch {
      return undefined;
    }
  }

  const rows = await db.select().from(videos).where(eq(videos.id, id)).limit(1);
  return rows[0];
}

export async function findAllVideosAdmin(access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.view");
  return db.select().from(videos).orderBy(videos.publishedAt);
}

export async function videoSlugExists(slug: string, excludeId?: number) {
  const where =
    excludeId != null
      ? and(eq(videos.slug, slug), ne(videos.id, excludeId))
      : eq(videos.slug, slug);
  const rows = await db
    .select({ id: videos.id })
    .from(videos)
    .where(where)
    .limit(1);
  return rows.length > 0;
}

export async function insertVideo(input: VideoWriteInput, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.create");

  const result = await db
    .insert(videos)
    .values({
      slug: input.slug,
      title: input.title,
      description: input.description,
      duration: input.duration,
      thumbnailSrc: input.thumbnailSrc,
      thumbnailAlt: input.thumbnailAlt,
      publishedAt: input.publishedAt,
    })
    .returning({ id: videos.id });
  const id = result[0]?.id;
  if (!id) throw new Error("Failed to insert video");
  return id;
}

export async function updateVideo(
  id: number,
  input: VideoWriteInput,
  access: AdminAccess,
) {
  await assertMemberPermission(access.memberId, "modules.video.edit");

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await db
    .update(videos)
    .set({
      slug: input.slug,
      title: input.title,
      description: input.description,
      duration: input.duration,
      thumbnailSrc: input.thumbnailSrc,
      thumbnailAlt: input.thumbnailAlt,
      publishedAt: input.publishedAt,
    })
    .where(eq(videos.id, id));
}

export async function deleteVideo(id: number, access: AdminAccess) {
  await assertMemberPermission(access.memberId, "modules.video.delete");

  const existing = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.id, id))
    .limit(1);
  if (!existing[0]) throw new PermissionDeniedError();

  await purgeMediaFolder(videoPath(id));
  await db.delete(videos).where(eq(videos.id, id));
}
