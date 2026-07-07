import { Readable } from "node:stream";
import { streamSnapshotBundle } from "@nextgen-cms/core/platform/snapshot";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { assertSessionPermission } from "@nextgen-cms/studio/admin/require-permission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireMember();
  const denied = assertSessionPermission(session, "settings.database");
  if (denied) return denied;

  const { stream, manifest } = streamSnapshotBundle();
  const filename = `pelak-snapshot-${new Date()
    .toISOString()
    .replaceAll(":", "-")}.tar.gz`;

  const webStream = Readable.toWeb(stream) as ReadableStream<Uint8Array>;

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/gzip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Snapshot-Schema-Revision": manifest.schemaRevision ?? "",
      "X-Snapshot-Uploads-Files": String(manifest.uploadsFileCount),
      "X-Snapshot-Uploads-Bytes": String(manifest.uploadsTotalBytes),
    },
  });
}
