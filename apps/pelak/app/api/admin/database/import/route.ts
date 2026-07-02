import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  backupDatabase,
  restoreDatabase,
} from "@nextgen-cms/core/platform/backup";
import {
  resolveBackupDir,
  resolveSqlitePath,
} from "@nextgen-cms/core/platform/paths";
import { getSchemaRevision } from "@nextgen-cms/core/platform/version";
import {
  assertSessionPermissionJson,
  requireMember,
} from "@nextgen-cms/studio/admin/require-permission";
import Database from "better-sqlite3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readSchemaRevision(dbPath: string): string | null {
  const sqlite = new Database(dbPath, { readonly: true });
  try {
    const row = sqlite
      .prepare(
        "SELECT value FROM platform_meta WHERE key = 'schema_revision' LIMIT 1",
      )
      .get() as { value?: string } | undefined;
    return row?.value ?? null;
  } catch {
    return null;
  } finally {
    sqlite.close();
  }
}

export async function POST(request: Request) {
  const session = await requireMember();
  const denied = assertSessionPermissionJson(session, "settings.database");
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("database");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "فایل دیتابیس ارسال نشده است." },
      { status: 400 },
    );
  }

  const tmpDir = mkdtempSync(join(tmpdir(), "pelak-db-import-"));
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.length === 0) {
      return Response.json(
        { error: "فایل دیتابیس خالی است." },
        { status: 400 },
      );
    }

    const importPath = join(tmpDir, "import.sqlite");
    writeFileSync(importPath, buffer);

    // Preflight: verify sqlite file can be opened and schema revision is not newer.
    try {
      const sqlite = new Database(importPath, { readonly: true });
      sqlite.prepare("SELECT 1").get();
      sqlite.close();
    } catch {
      return Response.json(
        { error: "فایل ارسال‌شده sqlite معتبر نیست." },
        { status: 400 },
      );
    }

    const incomingRevision = readSchemaRevision(importPath);
    const currentRevision = getSchemaRevision();
    if (incomingRevision && incomingRevision > currentRevision) {
      return Response.json(
        {
          error:
            "نسخه دیتابیس آپلودشده از نسخه فعلی نرم‌افزار جدیدتر است. ابتدا نرم‌افزار را ارتقا دهید.",
        },
        { status: 409 },
      );
    }

    const sqlitePath = resolveSqlitePath();
    const backupPath = backupDatabase(sqlitePath, resolveBackupDir(sqlitePath));
    restoreDatabase(importPath, sqlitePath);

    return Response.json({
      ok: true,
      backupPath,
      restoredSchemaRevision: incomingRevision,
    });
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}
