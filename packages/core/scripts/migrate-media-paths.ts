import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { normalizeFolderPath } from "@nextgen-cms/contract/media/folder-path";
import { eq, like, sql } from "drizzle-orm";
import { db } from "../src/db/index";
import {
  articles,
  authors,
  contentGroups,
  mediaAssets,
  members,
  videos,
} from "../src/db/schema";
import { countMediaReferences } from "../src/media/references";
import {
  resolveLegacyUploadPublicPath,
  resolveUploadPublicPath,
} from "../src/media/urls";
import { resolveUploadsDir } from "../src/platform/paths";

function remapFolderPath(folderPath: string): string | null {
  const folder = folderPath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!folder) return null;

  if (folder === "shared/site" || folder.startsWith("shared/site/")) {
    return folder === "shared/site"
      ? "site"
      : folder.replace(/^shared\/site\//, "site/");
  }

  if (folder.startsWith("shared/members/")) {
    return folder.replace(/^shared\/members\//, "members/");
  }

  const draftOnly = folder.match(/^content\/draft\/(\d+)$/);
  if (draftOnly) return `members/${draftOnly[1]}/draft`;

  const draftWithSub = folder.match(/^content\/draft\/(\d+)\/(.+)$/);
  if (draftWithSub)
    return `members/${draftWithSub[1]}/draft/${draftWithSub[2]}`;

  if (folder.startsWith("archived/content/")) {
    return folder.replace(/^archived\/content\//, "content/");
  }

  return null;
}

function ensureDirForFile(filePath: string) {
  const dir = filePath.slice(0, filePath.lastIndexOf("/"));
  if (dir) mkdirSync(dir, { recursive: true });
}

function moveFileOnDisk(fromRel: string, toRel: string) {
  const root = resolveUploadsDir();
  const from = join(root, fromRel);
  const to = join(root, toRel);
  if (!existsSync(from)) return false;
  if (existsSync(to)) return true;
  ensureDirForFile(to);
  renameSync(from, to);
  return true;
}

function moveDirectoryContents(fromDir: string, toDir: string) {
  const root = resolveUploadsDir();
  const from = join(root, fromDir);
  if (!existsSync(from)) return;
  mkdirSync(join(root, toDir), { recursive: true });
  for (const entry of readdirSync(from)) {
    const fromPath = join(from, entry);
    const toPath = join(root, toDir, entry);
    if (existsSync(toPath)) continue;
    ensureDirForFile(toPath);
    renameSync(fromPath, toPath);
  }
}

async function replaceUrlInDb(oldUrl: string, newUrl: string) {
  if (oldUrl === newUrl) return;

  await db
    .update(articles)
    .set({ heroSrc: newUrl })
    .where(eq(articles.heroSrc, oldUrl));

  await db
    .update(articles)
    .set({ body: sql`replace(${articles.body}, ${oldUrl}, ${newUrl})` })
    .where(like(articles.body, `%${oldUrl}%`));

  await db
    .update(members)
    .set({ avatarSrc: newUrl })
    .where(eq(members.avatarSrc, oldUrl));

  await db
    .update(authors)
    .set({ avatarSrc: newUrl })
    .where(eq(authors.avatarSrc, oldUrl));

  await db
    .update(contentGroups)
    .set({ coverSrc: newUrl })
    .where(eq(contentGroups.coverSrc, oldUrl));

  await db
    .update(videos)
    .set({ thumbnailSrc: newUrl })
    .where(eq(videos.thumbnailSrc, oldUrl));
}

async function migrateMediaAssets() {
  const rows = await db.select().from(mediaAssets);
  let moved = 0;

  for (const asset of rows) {
    const folderKey = asset.folderPath.replace(/\/$/, "");
    const newFolderKey = remapFolderPath(folderKey);
    if (!newFolderKey) continue;

    const newFolder = normalizeFolderPath(newFolderKey);
    const oldRel = `${folderKey}/${asset.filename}`;
    const newRel = `${newFolderKey}/${asset.filename}`;
    moveFileOnDisk(oldRel, newRel);

    const oldUrl = resolveUploadPublicPath(asset.folderPath, asset.filename);
    const newUrl = resolveUploadPublicPath(newFolder, asset.filename);

    await db
      .update(mediaAssets)
      .set({ folderPath: newFolder })
      .where(eq(mediaAssets.id, asset.id));

    await replaceUrlInDb(oldUrl, newUrl);
    moved++;
  }

  console.log(`Migrated ${moved} media_assets row(s).`);
}

async function migrateFlatRootFiles() {
  const root = resolveUploadsDir();
  let moved = 0;
  let removed = 0;

  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (!statSync(full).isFile()) continue;

    const legacyUrl = resolveLegacyUploadPublicPath(entry);
    const refs = await countMediaReferences(legacyUrl);
    if (refs === 0) {
      rmSync(full, { force: true });
      removed++;
      continue;
    }

    const targetRel = `site/${entry}`;
    moveFileOnDisk(entry, targetRel);
    const newUrl = resolveUploadPublicPath(normalizeFolderPath("site"), entry);
    await replaceUrlInDb(legacyUrl, newUrl);

    const assetRows = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.filename, entry));
    for (const asset of assetRows) {
      if (asset.folderPath === "" || asset.folderPath === "./") {
        await db
          .update(mediaAssets)
          .set({ folderPath: normalizeFolderPath("site") })
          .where(eq(mediaAssets.id, asset.id));
      }
    }
    moved++;
  }

  console.log(
    `Flat root: moved ${moved}, removed ${removed} unreferenced file(s).`,
  );
}

async function purgeOrphanDraftAssets() {
  const rows = await db
    .select()
    .from(mediaAssets)
    .where(like(mediaAssets.folderPath, "members/%/draft/%"));

  let removed = 0;
  for (const asset of rows) {
    const url = resolveUploadPublicPath(asset.folderPath, asset.filename);
    const refs = await countMediaReferences(url);
    if (refs > 0) continue;

    const root = resolveUploadsDir();
    const filePath = join(
      root,
      asset.folderPath.replace(/\/$/, ""),
      asset.filename,
    );
    if (existsSync(filePath)) rmSync(filePath, { force: true });
    await db.delete(mediaAssets).where(eq(mediaAssets.id, asset.id));
    removed++;
  }

  console.log(`Removed ${removed} orphan draft asset(s).`);
}

function cleanupLegacyDirectories() {
  const root = resolveUploadsDir();

  moveDirectoryContents("shared/site", "site");
  moveDirectoryContents("shared/members", "members");

  const sharedMembers = join(root, "shared", "members");
  if (existsSync(sharedMembers)) {
    for (const memberId of readdirSync(sharedMembers)) {
      const memberPath = join(sharedMembers, memberId);
      if (!statSync(memberPath).isDirectory()) continue;
      const draftLegacy = join(memberPath, "draft");
      if (existsSync(draftLegacy)) {
        moveDirectoryContents(
          `shared/members/${memberId}/draft`,
          `members/${memberId}/draft`,
        );
      }
      moveDirectoryContents(
        `shared/members/${memberId}`,
        `members/${memberId}`,
      );
    }
  }

  const contentDraft = join(root, "content", "draft");
  if (existsSync(contentDraft)) {
    for (const memberId of readdirSync(contentDraft)) {
      moveDirectoryContents(
        `content/draft/${memberId}`,
        `members/${memberId}/draft`,
      );
    }
  }

  const archivedContent = join(root, "archived", "content");
  if (existsSync(archivedContent)) {
    for (const contentId of readdirSync(archivedContent)) {
      moveDirectoryContents(
        `archived/content/${contentId}`,
        `content/${contentId}`,
      );
    }
  }

  for (const legacyDir of [
    join(root, "shared"),
    join(root, "archived"),
    join(root, "content", "draft"),
  ]) {
    if (existsSync(legacyDir)) {
      try {
        rmSync(legacyDir, { recursive: true, force: true });
        console.log(`Removed legacy directory: ${legacyDir}`);
      } catch {
        console.warn(`Could not remove: ${legacyDir}`);
      }
    }
  }
}

async function main() {
  console.log("Starting media path migration...");
  cleanupLegacyDirectories();
  await migrateMediaAssets();
  await migrateFlatRootFiles();
  await purgeOrphanDraftAssets();
  console.log("Media path migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
