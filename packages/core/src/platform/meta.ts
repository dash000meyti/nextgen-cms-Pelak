import type * as schema from "@nextgen-cms/core/db/schema";
import { platformMeta } from "@nextgen-cms/core/db/schema/platform-meta";
import { eq } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export type PlatformMetaKey =
  | "core_version"
  | "installed_at"
  | "schema_revision";

type PlatformMetaDb = BetterSQLite3Database<typeof schema>;

export function getPlatformMeta(
  db: PlatformMetaDb,
  key: PlatformMetaKey,
): string | null {
  const row = db
    .select()
    .from(platformMeta)
    .where(eq(platformMeta.key, key))
    .get();
  return row?.value ?? null;
}

export function setPlatformMeta(
  db: PlatformMetaDb,
  entries: Partial<Record<PlatformMetaKey, string>>,
): void {
  for (const [key, value] of Object.entries(entries)) {
    if (value === undefined) {
      continue;
    }
    db.insert(platformMeta)
      .values({ key, value })
      .onConflictDoUpdate({
        target: platformMeta.key,
        set: { value },
      })
      .run();
  }
}

export function isPlatformInstalled(db: PlatformMetaDb): boolean {
  return getPlatformMeta(db, "installed_at") !== null;
}
