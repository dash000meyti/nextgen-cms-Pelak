import type { ArticleStatus } from "@nextgen-cms/core/db/schema/articles";
import { listArticlesAdmin } from "@nextgen-cms/studio/cms/queries";
import { ContentAdminList } from "@/components/admin/studio/lists/ContentAdminList";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminArticlesPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const status = (statusParam as ArticleStatus | "all" | undefined) ?? "all";
  const articles = await listArticlesAdmin(status);

  return <ContentAdminList articles={articles} status={status} />;
}
