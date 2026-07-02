import { sectionAdminLabels } from "@nextgen-cms/contract/modules/labels";
import {
  currentJalaliYear,
  todayIsoIran,
} from "@nextgen-cms/core/platform/datetime";
import { getContentGroupModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { ContentGroupFormData } from "@nextgen-cms/studio/cms/mutations/content-group";
import { ContentGroupForm } from "@/components/admin/studio/ContentGroupForm";

export default async function NewContentGroupPage() {
  await requirePermission("modules.contentGroup.create");
  const settings = await getContentGroupModuleSettings();
  const period = settings.period;
  const labels = sectionAdminLabels(settings.pageTitle);

  const EMPTY_FORM: ContentGroupFormData = {
    number: 1,
    season: period === "yearly" ? "سالانه" : "",
    year: currentJalaliYear(),
    label: "",
    coverSrc: "",
    coverAlt: "",
    pdfSrc: "",
    publishedAt: todayIsoIran(),
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">{labels.newItem}</h1>
      <ContentGroupForm
        mode="create"
        initial={EMPTY_FORM}
        contentGroupPeriod={period}
      />
    </div>
  );
}
