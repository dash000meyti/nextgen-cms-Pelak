import { db } from "@nextgen-cms/core/db";
import { getPlatformMeta } from "@nextgen-cms/core/platform/meta";
import { CORE_VERSION } from "@nextgen-cms/core/platform/version";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    db.run(sql`SELECT 1`);

    const schemaRevision = getPlatformMeta(db, "schema_revision") ?? "unknown";

    return NextResponse.json({
      status: "ok",
      db: "ok",
      coreVersion: CORE_VERSION,
      schemaRevision,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        db: "unavailable",
        coreVersion: CORE_VERSION,
      },
      { status: 503 },
    );
  }
}
