import { ISSUE_PERIOD_LABELS } from "@nextgen-cms/contract/cms-schema/issue";
import {
  getIssues,
  getModuleSettings,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { IssueCard } from "@/components/issue/IssueCard";
import { IssueCardGrid } from "@/components/issue/IssueCardGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export async function generateMetadata(): Promise<Metadata> {
  const moduleSettings = await getModuleSettings();
  const title = ISSUE_PERIOD_LABELS[moduleSettings.issues.period];
  return {
    title,
    description: `آرشیو شماره‌های ${title} حکمران`,
  };
}

export default async function IssuesPage() {
  await requireFeatureModule("issues");
  const [issues, moduleSettings] = await Promise.all([
    getIssues(),
    getModuleSettings(),
  ]);
  const title = ISSUE_PERIOD_LABELS[moduleSettings.issues.period];

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mt-6">
        <SectionHeader
          title={title}
          description={`آرشیو شماره‌های ${title} سیاسی-اقتصادی حکمران.`}
        />
      </div>
      <IssueCardGrid>
        {issues.map((issue) => (
          <IssueCard key={issue.number} issue={issue} />
        ))}
      </IssueCardGrid>
    </Container>
  );
}
