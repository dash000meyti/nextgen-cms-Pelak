import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardGrid } from "@/components/article/ArticleCardGrid";
import { Container } from "@/components/layout/Container";

type LeadEssaysProps = {
  articles: ArticlePreview[];
};

export function LeadEssays({ articles }: LeadEssaysProps) {
  if (articles.length === 0) return null;

  return (
    <Container className="border-t border-rule py-10 md:py-12">
      <ArticleCardGrid columns={3}>
        {articles.map((article, index) => (
          <ArticleCard
            key={article.slug}
            article={article}
            priority={index === 0}
          />
        ))}
      </ArticleCardGrid>
    </Container>
  );
}
