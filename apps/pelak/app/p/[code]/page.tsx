import { parseShortLinkCode } from "@nextgen-cms/contract/short-links";
import {
  getContentGroupByNumber,
  getPublishedArticleById,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import { notFound, permanentRedirect } from "next/navigation";

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
    permanentRedirect(`/content/${result.slug}`);
  }

  await requireFeatureModule("contentGroup");
  const group = await getContentGroupByNumber(parsed.number);
  if (!group) notFound();
  permanentRedirect(`/content-group/${parsed.number}`);
}
