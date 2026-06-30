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
    <Container className="border-b border-rule py-8">
      <div className="space-y-10">
        <ArticleCard
          article={lead}
          variant="featuredLead"
          priority
          sectionTitle="محتوای ویژه"
        />
        {rest.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            {rest.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                variant="featuredRow"
              />
            ))}
          </div>
        ) : null}
      </div>
    </Container>
  );
}
