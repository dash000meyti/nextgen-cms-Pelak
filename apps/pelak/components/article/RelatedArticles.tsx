import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { SectionTitle } from "@/components/article/SectionHeader";
import { Divider } from "@/components/ui/Divider";

type RelatedArticlesProps = {
  articles: ArticlePreview[];
};

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="space-y-8">
      <Divider />
      <SectionTitle title="پیشنهادهای مرتبط" />
      <ArticleCardGrid columns={3}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </ArticleCardGrid>
    </section>
  );
}
