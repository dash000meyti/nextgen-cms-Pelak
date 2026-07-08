import { parseShortLinkCode } from "@nextgen-cms/contract/short-links";
import {
  getContentGroupById,
  getPublishedArticleById,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound, permanentRedirect } from "next/navigation";
import { encodeSlugSegment } from "@/lib/slug";

type ShortLinkPageProps = {
  params: Promise<{ code: string }>;
};

export default async function ShortLinkPage({ params }: ShortLinkPageProps) {
  const { code } = await params;
  const parsed = parseShortLinkCode(code);
  if (!parsed) notFound();

  if (parsed.kind === "content") {
    const result = await getPublishedArticleById(parsed.id);
    if (!result) notFound();
    permanentRedirect(`/content/${encodeSlugSegment(result.slug)}`);
  }

  await requireFeatureModule("contentGroup");
  const group = await getContentGroupById(parsed.id);
  if (!group) notFound();
  permanentRedirect(`/content-group/${encodeSlugSegment(group.slug)}`);
}
