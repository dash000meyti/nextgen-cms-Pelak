import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { resolveSqlitePath } from "@nextgen-cms/core/platform/paths";
import { requireMember } from "@nextgen-cms/studio/admin/require-member";
import { assertSessionPermission } from "@nextgen-cms/studio/admin/require-permission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireMember();
  const denied = assertSessionPermission(session, "settings.database");
  if (denied) return denied;

  const dbPath = resolveSqlitePath();
  const file = readFileSync(dbPath);
  const filename = basename(dbPath);

  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": "application/x-sqlite3",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
