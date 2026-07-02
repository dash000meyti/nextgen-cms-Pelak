import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import type { ContentGroupSummary } from "@nextgen-cms/contract/types/content-group";
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

function sortContentGroups(
  groups: ContentGroupSummary[],
): ContentGroupSummary[] {
  return [...groups].sort((a, b) => b.year - a.year || b.number - a.number);
}

function groupByYear(
  groups: ContentGroupSummary[],
): Array<{ year: number; groups: ContentGroupSummary[] }> {
  const map = new Map<number, ContentGroupSummary[]>();
  for (const group of groups) {
    const bucket = map.get(group.year) ?? [];
    bucket.push(group);
    map.set(group.year, bucket);
  }

  return [...map.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, yearGroups]) => ({
      year,
      groups: yearGroups.sort((a, b) => b.number - a.number),
    }));
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
  const sortedGroups = sortContentGroups(allGroups);
  const { items: pageGroups, totalPages } = paginateItems(sortedGroups, {
    page,
    perPage: settings.itemsPerPage,
  });

  if (settings.groupByYear) {
    const sections = groupByYear(pageGroups);

    return (
      <Container className="py-8 md:py-14">
        <Breadcrumbs
          items={[{ label: "خانه", href: "/" }, { label: title }]}
        />
        <div className="mt-6">
          <SectionHeader
            title={title}
            description={`آرشیو ${title} سیاسی-اقتصادی حکمران.`}
          />
        </div>
        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.year} className="space-y-6">
              <h2 className="text-block-title">
                سال {section.year.toLocaleString("fa-IR")}
              </h2>
              <ContentGroupCardGrid>
                {section.groups.map((group) => (
                  <ContentGroupCard key={group.number} group={group} />
                ))}
              </ContentGroupCardGrid>
            </section>
          ))}
        </div>
        <ListPagination
          page={page}
          totalPages={totalPages}
          basePath="/content-group"
        />
      </Container>
    );
  }

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
          <ContentGroupCard key={group.number} group={group} />
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
