import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import {
  getContentGroupModuleSettings,
  getContentGroups,
} from "@nextgen-cms/site-data/get-content";
import { requireFeatureModule } from "@nextgen-cms/site-data/require-feature-module";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { ContentGroupCard } from "@/components/content-group/ContentGroupCard";
import { ContentGroupCardGrid } from "@/components/content-group/ContentGroupCardGrid";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ListPagination } from "@/components/ui/ListPagination";

type ContentGroupsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContentGroupModuleSettings();
  return {
    title: settings.pageTitle,
    description: `آرشیو ${settings.pageTitle} حکمران`,
  };
}

export default async function ContentGroupsPage({
  searchParams,
}: ContentGroupsPageProps) {
  await requireFeatureModule("contentGroup");
  const params = await searchParams;
  const [allGroups, settings] = await Promise.all([
    getContentGroups(),
    getContentGroupModuleSettings(),
  ]);
  const title = settings.pageTitle;

  const page = parsePageParam(params.page);
  const { items: pageGroups, totalPages } = paginateItems(allGroups, {
    page,
    perPage: settings.itemsPerPage,
  });

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mt-6">
        <SectionHeader
          title={title}
          description={`آرشیو ${title} سیاسی-اقتصادی حکمران.`}
        />
      </div>
      <ContentGroupCardGrid>
        {pageGroups.map((group) => (
          <ContentGroupCard key={group.slug} group={group} />
        ))}
      </ContentGroupCardGrid>
      <ListPagination
        page={page}
        totalPages={totalPages}
        basePath="/content-group"
      />
    </Container>
  );
}
