import {
  getArticlesByTopic,
  getTopicBySlug,
} from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/layout/Container";

type TopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) return { title: "موضوع یافت نشد" };
  return {
    title: topic.name,
    description: topic.description,
    openGraph: { title: topic.name, description: topic.description },
  };
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const articles = await getArticlesByTopic(slug);

  return (
    <Container className="py-8 md:py-14">
      <Breadcrumbs
        items={[{ label: "خانه", href: "/" }, { label: topic.name }]}
      />
      <div className="mt-6">
        <SectionHeader title={topic.name} description={topic.description} />
      </div>
      <ArticleCardGrid columns={3}>
        {articles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            priority={index < 3}
          />
        ))}
      </ArticleCardGrid>
    </Container>
  );
}
