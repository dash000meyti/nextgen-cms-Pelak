import {
  hardDeleteMediaAsset,
  listArchivedMediaAssetsOlderThan,
} from "../src/db/repositories/media-assets";
import { countMediaReferences } from "../src/media/references";
import { removeMediaFile } from "../src/media/storage";

function parseOlderThanDays(argv: string[]): number {
  const arg = argv.find((item) => item.startsWith("--older-than-days="));
  if (!arg) return 90;
  const value = Number.parseInt(arg.split("=")[1] ?? "", 10);
  return Number.isNaN(value) || value < 1 ? 90 : value;
}

async function purgeArchivedMedia(olderThanDays: number): Promise<void> {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const assets = await listArchivedMediaAssetsOlderThan(cutoff);

  let removed = 0;
  let skipped = 0;

  for (const asset of assets) {
    const refCount = await countMediaReferences(asset.publicUrl);
    if (refCount > 0) {
      skipped++;
      continue;
    }

    await removeMediaFile(asset.folderPath, asset.filename);
    await hardDeleteMediaAsset(asset.id);
    removed++;
  }

  console.log(
    `Purged ${removed} archived media asset(s); skipped ${skipped} with references (older than ${olderThanDays} days).`,
  );
}

const olderThanDays = parseOlderThanDays(process.argv.slice(2));
purgeArchivedMedia(olderThanDays).catch((error) => {
  console.error(error);
  process.exit(1);
});
