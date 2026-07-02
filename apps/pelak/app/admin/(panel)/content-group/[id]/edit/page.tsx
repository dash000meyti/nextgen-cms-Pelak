import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import { getContentGroupModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { ContentGroupFormData } from "@nextgen-cms/studio/cms/mutations/content-group";
import { getContentGroupForAdmin } from "@nextgen-cms/studio/cms/queries";
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

  const group = await getContentGroupForAdmin(contentGroupId);
  if (!group) notFound();

  const settings = await getContentGroupModuleSettings();
  const labels = sectionAdminLabels(settings.pageTitle);

  const initial: ContentGroupFormData = {
    number: group.number,
    season: group.season,
    year: group.year,
    label: group.label,
    coverSrc: group.coverSrc,
    coverAlt: group.coverAlt,
    publishedAt: group.publishedAt,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.editItem}</h1>
      <ContentGroupForm
        mode="edit"
        contentGroupId={contentGroupId}
        initial={initial}
        contentGroupPeriod={settings.period}
      />
    </div>
  );
}
