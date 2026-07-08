import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import {
  getArticlesByTopic,
  getContentSettings,
  getTopicBySlug,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";
import { ListPagination } from "@/components/ui/ListPagination";
import {
  decodeSlugSegment,
  encodeSlugSegment,
  findBySlugCandidates,
} from "@/lib/slug";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { entity: topic } = await findBySlugCandidates(slug, getTopicBySlug);
  if (!topic) return { title: "موضوع یافت نشد" };
  return {
    title: topic.name,
    description: topic.description,
    openGraph: { title: topic.name, description: topic.description },
  };
}

export default async function TopicPage({
  params,
  searchParams,
}: TopicPageProps) {
  const [{ slug }, query, settings] = await Promise.all([
    params,
    searchParams,
    getContentSettings(),
  ]);
  const decodedSlug = decodeSlugSegment(slug);
  const { entity: topic } = await findBySlugCandidates(slug, getTopicBySlug);
  if (!topic) notFound();
  if (decodedSlug !== topic.slug) {
    permanentRedirect(`/topics/${encodeSlugSegment(topic.slug)}`);
  }

  const articles = await getArticlesByTopic(topic.slug);
  const page = parsePageParam(query.page);
  const { items: pageArticles, totalPages } = paginateItems(articles, {
    page,
    perPage: settings.itemsPerPage,
  });

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: topic.name }]}
      />
      <div className="mt-6">
        <SectionHeader title={topic.name} description={topic.description} />
      </div>
      <ArticleCardGrid columns={3}>
        {pageArticles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            priority={index < 3}
          />
        ))}
      </ArticleCardGrid>
      <ListPagination
        page={page}
        totalPages={totalPages}
        basePath={`/topics/${encodeSlugSegment(topic.slug)}`}
      />
    </Container>
  );
}
