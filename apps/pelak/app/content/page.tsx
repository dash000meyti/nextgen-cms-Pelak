import { getArticles, getTopics } from "@nextgen-cms/site-data/get-content";
import type { Metadata } from "next";
import { ArticleFilters } from "@/components/article/ArticleFilters";
import { SectionHeader } from "@/components/article/SectionHeader";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "محتوا",
  description: "آخرین محتوا و تحلیل‌های هفته‌نامه حکمران",
};

export default async function ArticlesPage() {
  const [articles, topics] = await Promise.all([getArticles(), getTopics()]);

  return (
    <Container className="py-8 md:py-14">
      <SectionHeader
        title="محتوا"
        description="تحلیل‌های راهبردی درباره سیاست، اقتصاد، امنیت و نظم جهانی."
      />
      <ArticleFilters topics={topics} articles={articles} />
    </Container>
  );
}
