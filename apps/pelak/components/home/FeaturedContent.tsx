import type { ArticlePreview } from "@nextgen-cms/contract/types/article";
import { ArticleCard } from "@/components/article/ArticleCard";
import { Container } from "@/components/layout/Container";

type FeaturedContentProps = {
  articles: ArticlePreview[];
};

export function FeaturedContent({ articles }: FeaturedContentProps) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles.slice(0, 3);

  return (
    <Container className="border-b border-rule py-10 md:py-20">
      <ArticleCard
        article={lead}
        variant="featuredLead"
        priority
        secondaryArticles={rest}
        authorTone="ink"
      />
    </Container>
  );
}
