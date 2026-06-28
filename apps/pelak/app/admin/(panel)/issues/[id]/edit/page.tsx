import { getModuleSettings } from "@nextgen-cms/site-data/get-content";
import { requirePermission } from "@nextgen-cms/studio/admin/require-permission";
import type { IssueFormData } from "@nextgen-cms/studio/cms/mutations/issue";
import { getIssueForAdmin } from "@nextgen-cms/studio/cms/queries";
import { notFound } from "next/navigation";
import { IssueForm } from "@/components/admin/studio/IssueForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditIssuePage({ params }: PageProps) {
  await requirePermission("modules.issues.edit");
  const { id } = await params;
  const issueId = Number.parseInt(id, 10);
  if (Number.isNaN(issueId)) notFound();

  const issue = await getIssueForAdmin(issueId);
  if (!issue) notFound();

  const moduleSettings = await getModuleSettings();

  const initial: IssueFormData = {
    number: issue.number,
    season: issue.season,
    year: issue.year,
    label: issue.label,
    coverSrc: issue.coverSrc,
    coverAlt: issue.coverAlt,
    publishedAt: issue.publishedAt,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl text-ink">ویرایش شماره</h1>
      <IssueForm
        mode="edit"
        issueId={issueId}
        initial={initial}
        issuePeriod={moduleSettings.issues.period}
      />
    </div>
  );
}
