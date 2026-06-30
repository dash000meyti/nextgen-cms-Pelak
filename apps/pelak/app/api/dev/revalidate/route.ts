import { CACHE_TAGS } from "@nextgen-cms/config/constants";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  revalidateTag(CACHE_TAGS.articles, "max");
  revalidateTag(CACHE_TAGS.contentGroups, "max");
  return NextResponse.json({ ok: true });
}
