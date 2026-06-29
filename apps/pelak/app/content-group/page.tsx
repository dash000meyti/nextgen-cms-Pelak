import { CONTENT_GROUP_PERIOD_LABELS } from "@nextgen-cms/contract/cms-schema/content-group";
import {
  getContentGroups,
  getModuleSettings,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { ContentGroupCard } from "@/components/content-group/ContentGroupCard";
import { ContentGroupCardGrid } from "@/components/content-group/ContentGroupCardGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

export async function generateMetadata(): Promise<Metadata> {
  const moduleSettings = await getModuleSettings();
  const title = CONTENT_GROUP_PERIOD_LABELS[moduleSettings.contentGroup.period];
  return {
    title,
    description: `آرشیو گروه‌های محتوای ${title} حکمران`,
  };
}

export default async function ContentGroupsPage() {
  await requireFeatureModule("contentGroup");
  const [groups, moduleSettings] = await Promise.all([
    getContentGroups(),
    getModuleSettings(),
  ]);
  const title = CONTENT_GROUP_PERIOD_LABELS[moduleSettings.contentGroup.period];

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mt-6">
        <SectionHeader
          title={title}
          description={`آرشیو گروه‌های محتوای ${title} سیاسی-اقتصادی حکمران.`}
        />
      </div>
      <ContentGroupCardGrid>
        {groups.map((group) => (
          <ContentGroupCard key={group.number} group={group} />
        ))}
      </ContentGroupCardGrid>
    </Container>
  );
}
