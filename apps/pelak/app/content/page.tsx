import { paginateItems, parsePageParam } from "@nextgen-cms/config/pagination";
import {
  getArticles,
  getContentSettings,
  getTopics,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { ArticleFilters } from "@/components/article/ArticleFilters";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";

type ContentPageProps = {
  searchParams: Promise<{ page?: string; topic?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getContentSettings();
  return {
    title: settings.pageTitle,
    description: "آخرین محتوا و تحلیل‌های هفته‌نامه حکمران",
  };
}

export default async function ArticlesPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const [articles, topics, settings] = await Promise.all([
    getArticles(),
    getTopics(),
    getContentSettings(),
  ]);

  const activeTopic = params.topic?.trim() || undefined;
  const filtered = activeTopic
    ? articles.filter((article) =>
        article.topics.some((topic) => topic.slug === activeTopic),
      )
    : articles;
  const page = parsePageParam(params.page);
  const { items: pageArticles, totalPages } = paginateItems(filtered, {
    page,
    perPage: settings.itemsPerPage,
  });

  return (
    <Container className="py-8 md:py-14">
      <SectionHeader
        title={settings.pageTitle}
        description="تحلیل‌های راهبردی درباره سیاست، اقتصاد، امنیت و نظم جهانی."
      />
      <ArticleFilters
        topics={topics}
        articles={pageArticles}
        activeTopic={activeTopic}
        page={page}
        totalPages={totalPages}
      />
    </Container>
  );
}
