import { rmSync } from "node:fs";
import { Readable } from "node:stream";
import {
  createSnapshotImportTempDir,
  restoreSnapshotFromTemp,
  streamExtractSnapshotBundle,
} from "@nextgen-cms/core/platform/snapshot";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { assertSessionPermissionJson } from "@nextgen-cms/studio/admin/require-permission";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = Number(process.env.SNAPSHOT_MAX_BYTES ?? 0) || 0;

export async function POST(request: Request) {
  const session = await requireMember();
  const denied = assertSessionPermissionJson(session, "settings.database");
  if (denied) return denied;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/gzip")) {
    return Response.json(
      {
        error:
          "محتوای ارسالی باید یک آرشیو tar.gz با Content-Type: application/gzip باشد.",
      },
      { status: 400 },
    );
  }

  if (!request.body) {
    return Response.json({ error: "بدنهٔ درخواست خالی است." }, { status: 400 });
  }

  const tempDir = createSnapshotImportTempDir();
  try {
    const nodeStream = Readable.fromWeb(
      request.body as unknown as Parameters<typeof Readable.fromWeb>[0],
    );

    let bytesReceived = 0;
    const counted = Readable.from(
      (async function* () {
        for await (const chunk of nodeStream) {
          bytesReceived += chunk.length;
          if (MAX_BYTES > 0 && bytesReceived > MAX_BYTES) {
            throw new Error("حجم آرشیو از حد مجاز تجاوز کرد.");
          }
          yield chunk;
        }
      })(),
    );

    let manifest: Awaited<ReturnType<typeof streamExtractSnapshotBundle>>;
    try {
      manifest = await streamExtractSnapshotBundle(counted, tempDir);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "استخراج آرشیو ناموفق بود.";
      return Response.json({ error: message }, { status: 400 });
    }

    let result: Awaited<ReturnType<typeof restoreSnapshotFromTemp>>;
    try {
      result = await restoreSnapshotFromTemp(tempDir);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "بازیابی snapshot ناموفق بود.";
      const status = message.includes("جدیدتر") ? 409 : 400;
      return Response.json({ error: message }, { status });
    }

    revalidatePath("/", "layout");

    return Response.json({
      ok: true,
      backupDbPath: result.backupDbPath,
      backupUploadsPath: result.backupUploadsPath,
      restoredSchemaRevision: result.restoredSchemaRevision,
      uploadsFileCount: manifest.uploadsFileCount,
      uploadsTotalBytes: manifest.uploadsTotalBytes,
    });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
