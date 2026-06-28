import {
  currentJalaliYear,
  todayIsoIran,
} from "@nextgen-cms/core/platform/datetime";
import { getModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { IssueFormData } from "@nextgen-cms/studio/cms/mutations/issue";
import { IssueForm } from "@/components/admin/studio/IssueForm";

export default async function NewIssuePage() {
  await requirePermission("modules.issues.create");
  const moduleSettings = await getModuleSettings();
  const period = moduleSettings.issues.period;

  const EMPTY_FORM: IssueFormData = {
    number: 1,
    season: period === "yearly" ? "سالانه" : "",
    year: currentJalaliYear(),
    label: "",
    coverSrc: "",
    coverAlt: "",
    publishedAt: todayIsoIran(),
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">شمارهٔ جدید</h1>
      <IssueForm mode="create" initial={EMPTY_FORM} issuePeriod={period} />
    </div>
  );
}
