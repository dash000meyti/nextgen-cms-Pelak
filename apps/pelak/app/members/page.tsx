import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import {
  getMemberSettings,
  getMembers,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { MemberCard } from "@/components/members/MemberCard";
import { ListPagination } from "@/components/ui/ListPagination";

type MembersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getMemberSettings();
  return {
    title: settings.pageTitle,
    description: `فهرست ${settings.pageTitle}`,
  };
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const [allMembers, settings] = await Promise.all([
    getMembers(),
    getMemberSettings(),
  ]);
  const page = parsePageParam(params.page);
  const { items: members, totalPages } = paginateItems(allMembers, {
    page,
    perPage: settings.itemsPerPage,
  });
  const title = settings.pageTitle;

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <div className="mt-6">
        <SectionHeader title={title} />
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {members.map((member) => (
          <li key={member.slug}>
            <MemberCard member={member} />
          </li>
        ))}
      </ul>
      <ListPagination
        page={page}
        totalPages={totalPages}
        basePath="/members"
      />
    </Container>
  );
}
