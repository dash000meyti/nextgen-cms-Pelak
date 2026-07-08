import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import {
  getContentGroupModuleSettings,
  getMediaSettings,
} from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { ContentGroupFormData } from "@nextgen-cms/studio/cms/mutations/content-group";
import {
  getContentGroupForAdmin,
  listArticlesAdmin,
} from "@nextgen-cms/studio/cms/queries";
import { notFound } from "next/navigation";
import { ContentGroupForm } from "@/components/admin/studio/ContentGroupForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditContentGroupPage({ params }: PageProps) {
  await requirePermission("modules.contentGroup.edit");
  const { id } = await params;
  const contentGroupId = Number.parseInt(id, 10);
  if (Number.isNaN(contentGroupId)) notFound();

  const [group, settings, mediaSettings, articles] = await Promise.all([
    getContentGroupForAdmin(contentGroupId),
    getContentGroupModuleSettings(),
    getMediaSettings(),
    listArticlesAdmin("all"),
  ]);
  if (!group) notFound();

  const labels = sectionAdminLabels(settings.pageTitle);

  const initial: ContentGroupFormData = {
    slug: group.slug,
    title: group.title,
    status: group.status,
    coverSrc: group.coverSrc,
    coverAlt: group.coverAlt,
    pdfSrc: group.pdfSrc ?? "",
    publishedAt: group.publishedAt,
    articleIds: group.articleIds,
  };

  const articleOptions = articles.map((article) => ({
    id: article.id,
    label: article.title,
    slug: article.slug,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.editItem}</h1>
      <ContentGroupForm
        mode="edit"
        contentGroupId={contentGroupId}
        initial={initial}
        articles={articleOptions}
        canDelete
        maxImageBytes={mediaSettings.maxImageBytes}
        maxPdfBytes={mediaSettings.maxPdfBytes}
        pageTitle={settings.pageTitle}
      />
    </div>
  );
}
