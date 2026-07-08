import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { todayIsoIran } from "@nextgen-cms/core/platform/datetime";
import {
  getContentGroupModuleSettings,
  getMediaSettings,
} from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { ContentGroupFormData } from "@nextgen-cms/studio/cms/mutations/content-group";
import { listArticlesAdmin } from "@nextgen-cms/studio/cms/queries";
import { ContentGroupForm } from "@/components/admin/studio/ContentGroupForm";

export default async function NewContentGroupPage() {
  await requirePermission("modules.contentGroup.create");
  const [settings, mediaSettings, articles] = await Promise.all([
    getContentGroupModuleSettings(),
    getMediaSettings(),
    listArticlesAdmin("all"),
  ]);
  const labels = sectionAdminLabels(settings.pageTitle);

  const initial: ContentGroupFormData = {
    slug: "",
    title: "",
    status: "draft",
    coverSrc: "",
    coverAlt: "",
    pdfSrc: "",
    publishedAt: todayIsoIran(),
    articleIds: [],
  };

  const articleOptions = articles.map((article) => ({
    id: article.id,
    label: article.title,
    slug: article.slug,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.newItem}</h1>
      <ContentGroupForm
        mode="create"
        initial={initial}
        articles={articleOptions}
        maxImageBytes={mediaSettings.maxImageBytes}
        maxPdfBytes={mediaSettings.maxPdfBytes}
        pageTitle={settings.pageTitle}
      />
    </div>
  );
}
